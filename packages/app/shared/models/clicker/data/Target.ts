import { BuildingId } from "@/shared/models/clicker/data/building/BuildingId";
import { ItemType } from "@/shared/models/clicker/data/ItemType";
import { UpgradeId } from "@/shared/models/clicker/data/upgrade/UpgradeId";
import { mergeObjectsStrict } from "@esposter/shared";
import { z } from "zod";

export const Target = mergeObjectsStrict(ItemType, UpgradeId, BuildingId);
export type Target = BuildingId | ItemType | UpgradeId;

export const targetSchema = z.nativeEnum(Target) satisfies z.ZodType<Target>;
