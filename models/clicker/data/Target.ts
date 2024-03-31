import { ItemType, itemTypeSchema } from "@/models/clicker/data/ItemType";
import { UpgradeName, upgradeNameSchema } from "@/models/clicker/data/UpgradeName";
import { BuildingName, buildingNameSchema } from "@/models/clicker/data/building/BuildingName";
import { z } from "zod";

export const Target = { ...ItemType, ...UpgradeName, ...BuildingName };
export type Target = ItemType | UpgradeName | BuildingName;

export const targetSchema = z.union([
  itemTypeSchema,
  upgradeNameSchema,
  buildingNameSchema,
]) satisfies z.ZodType<Target>;
