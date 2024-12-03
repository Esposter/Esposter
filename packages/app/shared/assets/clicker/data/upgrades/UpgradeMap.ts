import { mergeObjectsStrict } from "@esposter/shared";
import { CursorUpgradeMap } from "~~/shared/assets/clicker/data/upgrades/CursorUpgradeMap";
import { GrandmaUpgradeMap } from "~~/shared/assets/clicker/data/upgrades/GrandmaUpgradeMap";

export const UpgradeMap = mergeObjectsStrict(CursorUpgradeMap, GrandmaUpgradeMap);
