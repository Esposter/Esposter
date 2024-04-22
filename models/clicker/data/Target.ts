import { ItemType } from "@/models/clicker/data/ItemType";
import { BuildingId } from "@/models/clicker/data/building/BuildingId";
import { UpgradeId } from "@/models/clicker/data/upgrade/UpgradeId";
import { mergeObjectsStrict } from "@/util/mergeObjectsStrict";
import { z } from "zod";

export const Target = mergeObjectsStrict(ItemType, UpgradeId, BuildingId);
export type Target = ItemType | UpgradeId | BuildingId;

export const targetSchema = z.nativeEnum(Target) satisfies z.ZodType<Target>;
