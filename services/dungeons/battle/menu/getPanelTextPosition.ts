import { getCursorPosition } from "@/services/dungeons/battle/menu/getCursorPosition";
import type { Position } from "grid-engine";

export const getPanelTextPosition = (rowIndex: number, columnIndex: number): Position => {
  const cursorPosition = getCursorPosition(rowIndex, columnIndex);
  return {
    x: cursorPosition.x + 12,
    y: cursorPosition.y - 16,
  };
};
