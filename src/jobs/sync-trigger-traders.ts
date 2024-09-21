import { getAdverts } from "../services/triggertraders-client";
import prisma from "../db/db";
import log from "../services/logger";

const sync = async () => {
  const adverts = await getAdverts();

  const existingGunIds = await prisma.gun.findMany({
    select: {
      guntrader_id: true,
    },
  });

  const advertGunIdsSet = new Set(
    adverts.map((gun) => gun.external_system_id.replace("ssltd_", ""))
  );

  const existingGunIdsSet = new Set(
    existingGunIds.map((gun: any) => gun.guntrader_id)
  );

  const newAdverts = [...existingGunIdsSet].filter(
    (id) => !advertGunIdsSet.has(id)
  );

  const deadAdverts = [...advertGunIdsSet].filter(
    (id) => !existingGunIdsSet.has(id)
  );

  log.info({ deadAdverts }, "Dead adverts:");
  log.info({ newAdverts }, "New adverts:");

  process.exit(0);
};

export { sync };
