import type {
  IDbGun,
  ITriggerTradersAdvert,
  ITriggerTradersProduct,
} from "../types/types";
import { mapDbProductToTriggerTradersProduct } from "../utils/utils";
import log from "./logger";

const baseUrl = "https://www.triggertraders.com/api";
const username = Bun.env["TRIGGER_TRADERS_USER"] || "";
const password = Bun.env["TRIGGER_TRADERS_PASS"] || "";
const prefix = Bun.env["TRIGGER_TRADERS_PREFIX"] || "";
const email = Bun.env["TRIGGER_TRADERS_EMAIL"] || "";
const credentials = btoa(`${username}:${password}`);

interface AdvertsResponse {
  Products: ITriggerTradersAdvert[];
}

const getHeaders = () => {
  return {
    "Content-Type": "application/json",
    Authorization: `Basic ${credentials}`,
  };
};

const addProductToMap = async (product: ITriggerTradersProduct) => {
  try {
    const response = await fetch(`${baseUrl}/mapping/add`, {
      headers: getHeaders(),
      method: "POST",
      body: JSON.stringify(product),
    });

    if (!response.ok) {
      throw new Error(`Error adding product: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    log.error(error);
  }
};

const addBatchToMap = async (products: IDbGun[]) => {
  const BATCH_SIZE = 10; // Adjust the batch size according to your needs

  for (let i = 0; i < products.length; i += BATCH_SIZE) {
    const batch = products.slice(i, i + BATCH_SIZE);

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
        products.length / BATCH_SIZE
      )} processed.`
    );
  }
};

const setProductsLive = async () => {
  try {
    const response = await fetch(`${baseUrl}/mapping/map`, {
      headers: getHeaders(),
      method: "POST",
      body: JSON.stringify({
        client_email: `${
          Bun.env["TRIGGER_TRADERS_EMAIL"]
            ? Bun.env["TRIGGER_TRADERS_EMAIL"]
            : ""
        }`,
      }),
    });

    if (!response.ok) {
      throw new Error(
        `Error adding product: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    log.info(data);
  } catch (error) {
    log.error(error);
  }
};

const deleteAdvert = async (productId: string) => {
  const url = `${baseUrl}/mapping/advert/update/${prefix}_${productId}`;
  const body = JSON.stringify({
    client_email: `${
      Bun.env["TRIGGER_TRADERS_EMAIL"] ? Bun.env["TRIGGER_TRADERS_EMAIL"] : ""
    }`,
    advert_status: "5",
  });

  try {
    const response = await fetch(url, {
      headers: getHeaders(),
      method: "PUT",
      body: body,
    });

    const data = await response.json();
    log.info(data);

    if (!response.ok) {
      throw new Error(`Error deleting advert`);
    }

    return data;
  } catch (error) {
    log.error(error);
  }
};

const setAdvertSold = async (productId: string) => {
  try {
    const response = await fetch(
      `${baseUrl}/advert/update/${prefix}_${productId}`,
      {
        headers: getHeaders(),
        method: "PUT",
        body: JSON.stringify({
          client_email: `${
            Bun.env["TRIGGER_TRADERS_EMAIL"]
              ? Bun.env["TRIGGER_TRADERS_EMAIL"]
              : ""
          }`,
          advert_status: "4",
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Error setting advert status: ${response.statusText}`);
    }
  } catch (error) {
    log.error(error);
  }
};

const getAdverts = async () => {
  const url = `${baseUrl}/advert/email/${email}`;

  try {
    const response = await fetch(url, {
      headers: getHeaders(),
      method: "GET",
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Error fetching adverts: ${errorData}`);
    }

    const data = (await response.json()) as AdvertsResponse;
    return data.Products;
  } catch (error) {
    log.error(error);
  }
};

export {
  addProductToMap,
  setProductsLive,
  deleteAdvert,
  setAdvertSold,
  getAdverts,
  addBatchToMap,
};
