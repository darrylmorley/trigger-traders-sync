import prisma from "./db/db";
import log from "./services/logger";
import { mapDbProductToTriggerTradersProduct } from "./utils/utils";
import { addProductToMap } from "./services/triggertraders-client";

const BATCH_SIZE = 10; // Adjust the batch size according to your needs

const sync = async () => {
  try {
    const dbProducts = await prisma.gun.findMany({
      include: { images: true },
    });

    for (let i = 0; i < dbProducts.length; i += BATCH_SIZE) {
      const batch = dbProducts.slice(i, i + BATCH_SIZE);

      // Map products to promises and await resolution of all promises in the current batch
      const mappedProducts = await Promise.all(
        batch.map(async (product) => {
          const mappedItem = await mapDbProductToTriggerTradersProduct(product);
          return mappedItem;
        })
      );

      // Send each mapped product to the external system as soon as the batch is ready
      for (const mappedProduct of mappedProducts) {
        try {
          const result = await addProductToMap(mappedProduct);
          log.info(
            { result },
            `Successfully added product: ${mappedProduct.product_external_system_id}`
          );
        } catch (error) {
          log.error(
            `Failed to add product: ${mappedProduct.product_external_system_id}`,
            error
          );
        }
      }

      log.info(
        `Batch ${i / BATCH_SIZE + 1} of ${Math.ceil(
          dbProducts.length / BATCH_SIZE
        )} processed.`
      );
    }
  } catch (error) {
    log.error(`Error during sync: ${(error as Error).message}`);
  }
};

sync();
