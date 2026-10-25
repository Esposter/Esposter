import type { Figure } from "#src/models/genshinParity/shared/Figure";

import { formatFigure } from "#src/services/genshinParity/shared/formatFigure";

const METER_CELLS = 20;

// The meter's row: the value, its budget, the share of the budget used as a bar, and OVER when past it. A time past its
// Budget on another machine is printed beside the row and does not fail
export const formatRow = ({ budget, isChecked, name, unit, value }: Figure): { isOver: boolean; line: string } => {
  const label = name.padEnd(16);
  const figure = formatFigure(value, unit).padStart(12);
  if (budget === undefined) return { isOver: false, line: `${label}${figure}   no budget yet` };
  const share = budget > 0 ? value / budget : 0;
  const filled = Math.min(METER_CELLS, Math.round(share * METER_CELLS));
  const bar = `${"#".repeat(filled)}${"-".repeat(METER_CELLS - filled)}`;
  const percent = `${Math.round(share * 100)}%`.padStart(5);
  const isOver = value > budget;
  let status = "";
  if (isOver) status = isChecked ? "OVER" : "over, not checked on this machine";
  return {
    isOver: isOver && isChecked,
    line: `${label}${figure} / ${formatFigure(budget, unit).padEnd(12)} [${bar}]${percent} ${status}`.trimEnd(),
  };
};
