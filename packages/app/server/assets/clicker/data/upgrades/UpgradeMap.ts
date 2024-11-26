import { CursorUpgradeMap } from "@/server/assets/clicker/data/upgrades/CursorUpgradeMap";
import { GrandmaUpgradeMap } from "@/server/assets/clicker/data/upgrades/GrandmaUpgradeMap";
import { mergeObjectsStrict } from "@esposter/shared";

export const UpgradeMap = mergeObjectsStrict(CursorUpgradeMap, GrandmaUpgradeMap);
