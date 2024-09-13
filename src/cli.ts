#!/usr/bin/env bun
import { Command } from "commander";
import prisma from "./db/db";
import log from "./services/logger";
import {
  addProductToMap,
  setProductsLive,
} from "./services/triggertraders-client";
import { mapDbProductToTriggerTradersProduct } from "./utils/utils";

const program = new Command();

program
  .name("triggertraders-sync")
  .description("CLI to manage Guns-Sync operations")
  .version("1.0.0");

// Example command to update the gun database
program
  .command("sync-guns")
  .description("Sync guns from Guntrader API to the database")
  .action(async () => {
    try {
      console.log("Starting gun sync...");
      await updateGuns();
      console.log("Gun sync completed!");
    } catch (error) {
      console.error("Error syncing guns:", error);
    }
  });

// Command to send a product to the Trigger Traders API Mapping Table
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

// Command to set products as live on Trigger Traders
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

// Parse CLI arguments
program.parse(process.argv);
