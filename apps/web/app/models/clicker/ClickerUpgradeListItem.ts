import type { Upgrade } from "#shared/models/clicker/data/upgrade/Upgrade";
import type { ClickerListItem } from "@/models/clicker/ClickerListItem";

// An upgrade's row, carrying the upgrade its details open on
export interface ClickerUpgradeListItem extends ClickerListItem {
  upgrade: Upgrade;
}
