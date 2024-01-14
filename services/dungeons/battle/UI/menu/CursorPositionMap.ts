import { INITIAL_CURSOR_POSITION } from "@/services/dungeons/battle/UI/menu/constants";
import { type Position } from "grid-engine";

export const CursorPositionMap: [[Position, Position], [Position, Position]] = [
  [
    { x: INITIAL_CURSOR_POSITION.x, y: INITIAL_CURSOR_POSITION.y },
    { x: 228, y: INITIAL_CURSOR_POSITION.y },
  ],
  [
    { x: INITIAL_CURSOR_POSITION.x, y: 86 },
    { x: 228, y: 86 },
  ],
];
