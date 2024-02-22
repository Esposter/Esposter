import { INITIAL_CURSOR_POSITION } from "@/services/dungeons/title/menu/constants";
import type { Position } from "grid-engine";

export const CursorPositionMap = [
  [{ x: INITIAL_CURSOR_POSITION.x, y: 41 }],
  [{ x: INITIAL_CURSOR_POSITION.x, y: 91 }],
  [{ x: INITIAL_CURSOR_POSITION.x, y: 141 }],
] as const satisfies [[Position], [Position], [Position]];
