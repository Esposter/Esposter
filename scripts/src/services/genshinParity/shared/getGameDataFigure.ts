import type { Figure } from "#src/models/genshinParity/shared/Figure";

import { LoadFigureUnit } from "#src/models/genshinParity/page/LoadFigureUnit";

// The game data a load or a crossing fetched, checked against the budget its meter names for it
export const getGameDataFigure = (budget: undefined | { gameDataBytes?: number }, gameDataBytes: number): Figure => ({
  budget: budget?.gameDataBytes,
  isChecked: true,
  name: "game data",
  unit: LoadFigureUnit.Kilobytes,
  value: gameDataBytes,
});
