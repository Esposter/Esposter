import type { Building } from "#shared/models/clicker/data/building/Building";
import type { ClickerListItem } from "@/models/clicker/ClickerListItem";

// A building's row, carrying the building its details open on
export interface ClickerBuildingListItem extends ClickerListItem {
  building: Building;
}
