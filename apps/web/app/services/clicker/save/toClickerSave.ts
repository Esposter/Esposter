import type { Clicker } from "#shared/models/clicker/data/Clicker";

import { ClickerSave } from "#shared/models/clicker/data/ClickerSave";

// Serializes the in-memory game state down to ids and counters so content
// Rebalances in `BuildingMap`/`UpgradeMap` always reach existing saves.
export const toClickerSave = (clicker: Clicker) =>
  new ClickerSave({
    ...clicker,
    boughtBuildings: clicker.boughtBuildings.map(({ amount, id, producedValue }) => ({ amount, id, producedValue })),
    boughtUpgrades: clicker.boughtUpgrades.map(({ id }) => id),
  });
