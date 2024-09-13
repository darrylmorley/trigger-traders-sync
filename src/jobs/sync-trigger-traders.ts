import { schedule } from "node-cron";
import log from "../services/logger";
import prisma from "../db/db";
import { mapDbProductToTriggerTradersProduct } from "../utils/utils";

const syncTriggerTraders = schedule("*/1 * * * *", async () => {
  log.info("Updating Trigger Traders");

  const dbProducts = await prisma.gun.findMany({
    include: { images: true },
    take: 50,
  });

  const mappedProducts = dbProducts.map((product) =>
    mapDbProductToTriggerTradersProduct(product)
  );

  console.log(mappedProducts);

  log.info("Trigger Traders updated");
});

syncTriggerTraders.start();
