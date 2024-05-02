import { CursorUpgradeMap } from "@/assets/clicker/data/upgrades/CursorUpgradeMap";
import { GrandmaUpgradeMap } from "@/assets/clicker/data/upgrades/GrandmaUpgradeMap";
import { mergeObjectsStrict } from "@/util/mergeObjectsStrict";

export const UpgradeMap = mergeObjectsStrict(CursorUpgradeMap, GrandmaUpgradeMap);
