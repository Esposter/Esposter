import { z } from "zod";

export enum ItemType {
  VuetifyComponent = "VuetifyComponent",
}

export const itemTypeSchema = z.nativeEnum(ItemType);
