import { BuildingId } from "@/models/clicker/data/building/BuildingId";
import { ItemType } from "@/models/clicker/data/ItemType";
import { UpgradeId } from "@/models/clicker/data/upgrade/UpgradeId";
import { mergeObjectsStrict } from "@/util/object/mergeObjectsStrict";
import { z } from "zod";

export const Target = mergeObjectsStrict(ItemType, UpgradeId, BuildingId);
export type Target = BuildingId | ItemType | UpgradeId;

export const targetSchema = z.nativeEnum(Target) satisfies z.ZodType<Target>;
