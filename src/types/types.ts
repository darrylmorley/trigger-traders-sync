import type { Gun } from "@prisma/client";
import type { Image } from "@prisma/client";

export interface IDbGun extends Gun {
  images: IImage[];
}

export interface IImage extends Image {}

export interface IImagePaths {
  small: string;
  medium: string;
  large: string;
  original: string;
}

export interface ITriggerTradersProduct {
  client_external_system_id: string;
  client_email: string;
  product_external_system_id: string;
  advert_type: string;
  advert_status_id: string;
  product_details: string;
  mechanism: string;
  manufacturer: string;
  model: string;
  calibre: string;
  condition: string;
  orientation: string;
  stock_length: string;
  barrel_length: string;
  trigger_type: string;
  choke_type: string;
  price: string;
  img: string[];
}

export interface ITriggerTradersAdvert {
  entity_id: string;
  ad_advert_id: string;
  ad_title: string;
  advert_id: string;
  advert_description: string;
  advert_status: "Active" | "Sold";
  ad_type: string;
  price: string;
  created_date: string;
  product_description: string;
  product_type_description: string;
  manufacturer_id: string;
  manufacturer: string;
  model: string;
  mechanism: string;
  calibre: string;
  orientation: string;
  chamber_description: string;
  trigger_description: string;
  condition: "New" | "Used";
  barrel_description: string;
  cased: string;
  barrel_length_inches: string;
  barrel_length_inches_fraction: string;
  stock_length_inches: string;
  stock_length_inches_fraction: string;
  weight_pound: string;
  weight_ounce: string;
  choke_type: string;
  choke_type_2: string;
  ejection: string;
  certificate: string;
  serial_number: string;
  stock_number: string;
  external_system_id: string;
}
