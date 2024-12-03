import { CursorUpgradeMap } from "#shared/assets/clicker/data/upgrades/CursorUpgradeMap";
import { GrandmaUpgradeMap } from "#shared/assets/clicker/data/upgrades/GrandmaUpgradeMap";
import { mergeObjectsStrict } from "@esposter/shared";

export const UpgradeMap = mergeObjectsStrict(CursorUpgradeMap, GrandmaUpgradeMap);
