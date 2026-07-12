import type { BoughtBuilding } from "#shared/models/clicker/data/building/BoughtBuilding";
import type { Building } from "#shared/models/clicker/data/building/Building";

export interface BuildingWithStats extends BoughtBuilding, Building {}
