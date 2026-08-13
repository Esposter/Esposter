import type { BoughtBuilding } from "#shared/models/clicker/data/building/BoughtBuilding";
import type { BuildingWithStats } from "#shared/models/clicker/data/building/BuildingWithStats";
import type { Upgrade } from "#shared/models/clicker/data/upgrade/Upgrade";
import type { UpgradeId } from "#shared/models/clicker/data/upgrade/UpgradeId";

import { BuildingMap } from "#shared/assets/clicker/data/BuildingMap";
import { UpgradeMap } from "#shared/assets/clicker/data/upgrades/UpgradeMap";
import { Clicker } from "#shared/models/clicker/data/Clicker";
import { clickerSaveSchema } from "#shared/models/clicker/data/ClickerSave";

// Copies into fresh objects — the content maps are shared definitions and must never be mutated
const toBuildingWithStats = ({ amount, id, producedValue }: BoughtBuilding): BuildingWithStats => ({
  ...BuildingMap[id],
  amount,
  id,
  producedValue,
});
const toUpgrade = (id: UpgradeId): Upgrade => ({ ...UpgradeMap[id], id });
// Hydrates a stored save back into the in-memory game state by resolving ids through
// The content maps, falling back to a fresh game for unreadable saves.
export const toClicker = (savedClicker: unknown) => {
  const parsedClickerSave = clickerSaveSchema.safeParse(savedClicker);
  if (!parsedClickerSave.success) return new Clicker();

  const { boughtBuildings, boughtUpgrades, ...clickerSave } = parsedClickerSave.data;
  return new Clicker({
    ...clickerSave,
    boughtBuildings: boughtBuildings.map((boughtBuilding) => toBuildingWithStats(boughtBuilding)),
    boughtUpgrades: boughtUpgrades.map((id) => toUpgrade(id)),
  });
};
