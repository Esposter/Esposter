import type { Figure } from "#src/models/genshinParity/shared/Figure";

import { LoadFigureUnit } from "#src/models/genshinParity/page/LoadFigureUnit";

// The requests a load or a crossing made, checked against the budget its meter names for it
export const getRequestsFigure = (budget: undefined | { requests?: number }, requests: number): Figure => ({
  budget: budget?.requests,
  isChecked: true,
  name: "requests",
  unit: LoadFigureUnit.Count,
  value: requests,
});
