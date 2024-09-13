import type { TriggerTradersProduct } from "../types/types";
import log from "./logger";

const baseUrl = "https://www.triggertraders.com/api/mapping";
const username = Bun.env["TRIGGER_TRADERS_USER"] || "";
const password = Bun.env["TRIGGER_TRADERS_PASS"] || "";
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

const setAdvertStatus = async (productId: string, advertStatusCode: string) => {
  try {
    const response = await fetch(`${baseUrl}/advert/update/${productId}`, {
      headers: getHeaders(),
      method: "POST",
      body: JSON.stringify({
        client_email: `${
          Bun.env["TRIGGER_TRADERS_USER"] ? Bun.env["TRIGGER_TRADERS_USER"] : ""
        }`,
        advert_status: advertStatusCode,
      }),
    });

    if (!response.ok) {
      throw new Error(`Error setting advert status: ${response.statusText}`);
    }
  } catch (error) {
    log.error(error);
  }
};

const deleteAdvert = async (productId: string) => {
  try {
    const response = await fetch(`${baseUrl}/advert/update/${productId}`, {
      headers: getHeaders(),
      method: "POST",
      body: JSON.stringify({
        client_email: `${
          Bun.env["TRIGGER_TRADERS_USER"] ? Bun.env["TRIGGER_TRADERS_USER"] : ""
        }`,
        advert_status: "5",
      }),
    });

    if (!response.ok) {
      throw new Error(`Error setting advert status: ${response.statusText}`);
    }
  } catch (error) {
    log.error(error);
  }
};

const setAdvertSold = async (productId: string) => {
  try {
    const response = await fetch(`${baseUrl}/advert/update/${productId}`, {
      headers: getHeaders(),
      method: "POST",
      body: JSON.stringify({
        client_email: `${
          Bun.env["TRIGGER_TRADERS_USER"] ? Bun.env["TRIGGER_TRADERS_USER"] : ""
        }`,
        advert_status: "5",
      }),
    });

    if (!response.ok) {
      throw new Error(`Error setting advert status: ${response.statusText}`);
    }
  } catch (error) {
    log.error(error);
  }
};

export {
  addProductToMap,
  setProductsLive,
  setAdvertStatus,
  deleteAdvert,
  setAdvertSold,
};
