import { BuildingName, buildingNameSchema } from "@/models/clicker/BuildingName";
import { ItemType, itemTypeSchema } from "@/models/clicker/ItemType";
import { UpgradeName, upgradeNameSchema } from "@/models/clicker/UpgradeName";
import { z } from "zod";

export const Target = { ...ItemType, ...UpgradeName, ...BuildingName };
export type Target = ItemType | UpgradeName | BuildingName;

export const targetSchema = z.union([
  itemTypeSchema,
  upgradeNameSchema,
  buildingNameSchema,
]) satisfies z.ZodType<Target>;
