import type { Position } from "grid-engine";

import { CURSOR_POSITION_INCREMENT, INITIAL_CURSOR_POSITION } from "@/services/dungeons/scene/battle/menu/constants";

export const getCursorPosition = (rowIndex: number, columnIndex: number): Position => ({
  x: INITIAL_CURSOR_POSITION.x + CURSOR_POSITION_INCREMENT.x * columnIndex,
  y: INITIAL_CURSOR_POSITION.y + CURSOR_POSITION_INCREMENT.y * rowIndex,
});
