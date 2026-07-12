import { BuildingMap } from "#shared/assets/clicker/data/BuildingMap";
import { UpgradeMap } from "#shared/assets/clicker/data/upgrades/UpgradeMap";
import { Clicker } from "#shared/models/clicker/data/Clicker";
import { clickerSaveMigrationSchema } from "#shared/models/clicker/data/ClickerSave";

// Hydrates a stored save (current or legacy shape) back into the in-memory game state by
// resolving ids through the content maps, falling back to a fresh game for unreadable saves.
export const toClicker = (savedClicker: unknown) => {
  const parsedClickerSave = clickerSaveMigrationSchema.safeParse(savedClicker);
  if (!parsedClickerSave.success) return new Clicker();

  const { boughtBuildings, boughtUpgrades, ...clickerSave } = parsedClickerSave.data;
  return new Clicker({
    ...clickerSave,
    boughtBuildings: boughtBuildings.map(({ amount, id, producedValue }) => ({
      ...BuildingMap[id],
      amount,
      id,
      producedValue,
    })),
    boughtUpgrades: boughtUpgrades.map((id) => ({ ...UpgradeMap[id], id })),
  });
};
