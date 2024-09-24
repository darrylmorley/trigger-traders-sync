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

  const imageUrls = product.images.map((image) => image.original_url);
  if (imageUrls.includes(undefined)) {
    throw new Error("One or more image URLs are undefined");
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
    orientation: product.orientation || "",
    stock_length: product.stock_dimensions || "",
    barrel_length: product.barrel_dimensions || "",
    trigger_type: product.trigger || "",
    choke_type: product.choke || "",
    price: product.price ? `${product.price / 100}` : "0",
    img: imageUrls, // Pass image URLs directly
  };

  log.info({ mappedProduct }, "Mapped Product");
  return mappedProduct;
}

export { imageUrlToBase64, mapDbProductToTriggerTradersProduct };
