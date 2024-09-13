import log from "../services/logger";
import type { DbProduct, TriggerTradersProduct } from "../types/types";

async function imageUrlToBase64(imageUrl: string): Promise<string | undefined> {
  try {
    const response = await fetch(imageUrl);

    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }

    const buffer = await response.arrayBuffer();
    const base64Image = Buffer.from(buffer).toString("base64");

    return base64Image;
  } catch (error) {
    log.error(`Error converting image to base64: ${(error as Error).message}`);
    return undefined;
  }
}

async function mapDbProductToTriggerTradersProduct(
  product: DbProduct
): Promise<TriggerTradersProduct> {
  if (!product.images) {
    throw new Error("Product images are undefined");
  }

  const BATCH_SIZE = 10; // Limit to 10 concurrent requests

  const imageUrls = product.images.map((image) => image.original_url);
  if (imageUrls.includes(undefined)) {
    throw new Error("One or more image URLs are undefined");
  }

  const base64Images: string[] = [];

  // Function to create batches of promises
  function chunkArray<T>(arr: T[], size: number): T[][] {
    const result = [];
    for (let i = 0; i < arr.length; i += size) {
      result.push(arr.slice(i, i + size));
    }
    return result;
  }

  // Create batches of image fetch promises
  const imageBatches = chunkArray(imageUrls, BATCH_SIZE);

  for (const batch of imageBatches) {
    // Wait for each batch of promises to resolve
    const base64Batch = await Promise.all(
      batch.map(async (imageUrl) => {
        try {
          if (!imageUrl) throw new Error("Image URL is undefined");
          const base64Image = await imageUrlToBase64(imageUrl);
          return base64Image || null; // Return null if there's an error
        } catch (error) {
          log.error(`Error processing image URL ${imageUrl}: ${error}`);
          return null; // Return null to avoid breaking the batch
        }
      })
    );

    // Filter out null or undefined base64 images
    base64Images.push(
      ...base64Batch.filter(
        (img): img is string => img !== null && img !== undefined
      )
    );
  }

  const mappedProduct = {
    client_email: Bun.env["TRIGGER_TRADERS_EMAIL"] || "",
    client_external_system_id: "1",
    product_external_system_id: `${Bun.env["TRIGGER_TRADERS_PREFIX"]}_${product.guntrader_id}`,
    advert_type: "1",
    advert_status_id: "1",
    product_details: product.type,
    mechanism: product.mechanism,
    manufacturer: product.make,
    model: product.model,
    calibre: product.calibre,
    condition: product.is_new ? "New" : "Used",
    orientation: product.orientation ? product.orientation : "",
    stock_length: product.stock_dimensions ? product.stock_dimensions : "",
    barrel_length: product.barrel_dimensions ? product.barrel_dimensions : "",
    trigger_type: product.trigger ? product.trigger : "",
    choke_type: product.choke ? product.choke : "",
    price: product.price ? `${product.price / 100}` : "0",
    img: [...base64Images], // Ensure images are properly resolved
  };

  log.info({ mappedProduct }, "Mapped Product");
  return mappedProduct;
}

export { imageUrlToBase64, mapDbProductToTriggerTradersProduct };
