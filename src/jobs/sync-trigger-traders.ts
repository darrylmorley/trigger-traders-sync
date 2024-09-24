import {
  deleteAdvert,
  getAdverts,
  addBatchToMap,
} from "../services/triggertraders-client";
import log from "../services/logger";
import prisma from "../db/db";
import type { IDbGun, ITriggerTradersAdvert } from "../types/types";

const fetchGunIds = async () => {
  return await prisma.gun.findMany({
    select: {
      guntrader_id: true,
    },
  });
};

const fetchDbGuns = async (gunIDs: string[]) => {
  if (!gunIDs) throw new Error("You need to pass gun IDs");

  return await prisma.gun.findMany({
    where: {
      guntrader_id: {
        in: gunIDs,
      },
    },
    include: {
      images: true,
    },
  });
};

const fetchAdverts = async () => {
  return await getAdverts();
};

const fetchData = async (): Promise<any> => {
  const [gunIds, adverts] = await Promise.all([fetchGunIds(), fetchAdverts()]);

  if (!adverts) {
    log.error("No Adverts");
    throw new Error("No Adverts");
  }

  if (!gunIds) {
    log.error("No Gun Ids");
    throw new Error("No Gun Ids");
  }

  return { gunIds, adverts };
};

const mapGunIdsFromAdverts = (adverts: ITriggerTradersAdvert[]): string[] => {
  if (!adverts) throw new Error("You need to pass adverts");
  return adverts.map((gun) => {
    if (!gun.external_system_id) {
      log.error("No external system id");
      throw new Error(
        `No external system id for advert id: ${gun.ad_advert_id}`
      );
    }

    return gun.external_system_id.replace("ssltd_", "");
  });
};

const mapGunIdsFromDb = (guns: IDbGun[]): string[] => {
  if (!guns) throw new Error("You need to pass an array of gun ids");
  return guns.map((gun: IDbGun) => gun.guntrader_id);
};

const filterIds = (dbGunIds: string[], advertGunIds: string[]) => {
  const deadAdverts = advertGunIds.filter((id) => !dbGunIds.includes(id));
  const newAdverts = dbGunIds.filter((id) => !advertGunIds.includes(id));

  return { newAdverts, deadAdverts };
};

const sync = async () => {
  log.info(`Syncing gun adverts...`);

  const { gunIds, adverts } = await fetchData();

  const dbGunIds: string[] = mapGunIdsFromDb(gunIds);
  const advertGunIds = mapGunIdsFromAdverts(adverts);

  const { newAdverts, deadAdverts } = filterIds(dbGunIds, advertGunIds);

  for (const productId of deadAdverts) {
    log.info(`Deleting advert: ${productId}`);
    await deleteAdvert(productId);
  }

  const dbGuns: IDbGun[] = await fetchDbGuns(newAdverts);

  await addBatchToMap(dbGuns);

  log.info(`Sync complete:`);
  log.info(`New Adverts: ${newAdverts.length}`);
  log.info(`Adverts deleted: ${deadAdverts.length}`);

  process.exit(0);
};

export { sync };
