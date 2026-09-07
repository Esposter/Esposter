import { BuildingId } from "#shared/models/clicker/data/building/BuildingId";
import { ItemType } from "#shared/models/clicker/data/ItemType";
import { UpgradeId } from "#shared/models/clicker/data/upgrade/UpgradeId";
import { mergeObjectsStrict } from "@esposter/shared";

export const Target = mergeObjectsStrict(ItemType, UpgradeId, BuildingId);
export type Target = BuildingId | ItemType | UpgradeId;
