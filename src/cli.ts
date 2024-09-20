#!/usr/bin/env bun
import { Command } from "commander";
import prisma from "./db/db";
import log from "./services/logger";
import {
  addProductToMap,
  deleteAdvert,
  setAdvertSold,
  setProductsLive,
} from "./services/triggertraders-client";
import { mapDbProductToTriggerTradersProduct } from "./utils/utils";

const program = new Command();

program
  .name("trigger-traders-sync")
  .description("CLI to manage Trigger Traders Adverts")
  .version("1.0.0");

program
  .command("send-trigger-product <productId>")
  .description("Send a product to the Trigger Traders API Mapping Table")
  .action(async (productId) => {
    try {
      const product = await prisma.gun.findUnique({
        where: { guntrader_id: productId },
        include: { images: true },
      });

      if (!product) {
        throw new Error("Product not found");
      }

      console.log("Sending product to the Trigger Traders mapping table...");

      const mappedProduct = await mapDbProductToTriggerTradersProduct(product);

      console.log(
        `The mapped product: ${JSON.stringify(mappedProduct, null, 2)}`
      );

      const send = await addProductToMap(mappedProduct);
      console.log("Product sent to Trigger Traders mapping table:", send);
    } catch (error) {
      log.error(error);
    }
  });

program
  .command("set-live")
  .description("Set all products as live on Trigger Traders")
  .action(async () => {
    try {
      console.log("Setting all products live on Trigger Traders...");
      await setProductsLive();
      console.log("Products set live on Trigger Traders!");
    } catch (error) {
      log.error(error);
    }
  });

program
  .command("set-advert sold <productId>")
  .description("Mark advert as sold.")
  .action(async (productId) => {
    try {
      console.log("Marking advert as sold...");
      await setAdvertSold(productId);
      console.log("Advert marked as sold!");
    } catch (error) {
      log.error(error);
    }
  });

program
  .command("delete-advert <productId>")
  .description("Delete advert.")
  .action(async (productId) => {
    try {
      console.log("Deleting advert...");
      const res = await deleteAdvert(productId);
      // console.log(res);
      if (res.error) {
        throw new Error("Error deleting advert");
      }

      if (res.Message["Product Message"] === "Update Successful") {
        console.log("Advert deleted!");
      }
    } catch (error) {
      log.error(error);
    }
  });

// Parse CLI arguments
program.parse(process.argv);
