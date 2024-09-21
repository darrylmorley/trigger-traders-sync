import type { TriggerTradersProduct } from "../types/types";
import log from "./logger";

const baseUrl = "https://www.triggertraders.com/api/mapping";
const username = Bun.env["TRIGGER_TRADERS_USER"] || "";
const password = Bun.env["TRIGGER_TRADERS_PASS"] || "";
const prefix = Bun.env["TRIGGER_TRADERS_PREFIX"] || "";
const credentials = btoa(`${username}:${password}`);

const getHeaders = () => {
  return {
    "Content-Type": "application/json",
    Authorization: `Basic ${credentials}`,
  };
};

const addProductToMap = async (product: TriggerTradersProduct) => {
  try {
    const response = await fetch(`${baseUrl}/add`, {
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

const setProductsLive = async () => {
  try {
    const response = await fetch(`${baseUrl}/map`, {
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
      throw new Error(`Error adding product: ${response.statusText}`);
    }

    const data = await response.json();
    log.info(data);
  } catch (error) {
    log.error(error);
  }
};

const deleteAdvert = async (productId: string) => {
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
          advert_status: "5",
        }),
      }
    );

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
  try {
    const response = await fetch(
      `${baseUrl}/advert/email/${Bun.env["TRIGGER_TRADERS_EMAIL"]}`,
      {
        headers: getHeaders(),
        method: "GET",
      }
    );

    if (!response.ok) {
      throw new Error(`Error fetching adverts: ${response}`);
    }
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
};
