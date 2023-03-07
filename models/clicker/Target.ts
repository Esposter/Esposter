import { BuildingName } from "@/models/clicker/BuildingName";
import { ItemType } from "@/models/clicker/ItemType";
import { UpgradeName } from "@/models/clicker/UpgradeName";

export const Target = { ...ItemType, ...UpgradeName, ...BuildingName };
export type Target = ItemType | UpgradeName | BuildingName;
