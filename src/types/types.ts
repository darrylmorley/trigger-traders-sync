import type { Prisma } from "@prisma/client";

export interface DbProduct extends Prisma.GunCreateInput {
  images: Image[];
}

export interface Image extends Prisma.ImageCreateInput {}

export interface ImagePaths {
  small: string;
  medium: string;
  large: string;
  original: string;
}

export interface TriggerTradersProduct {
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
