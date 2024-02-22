import type { Except } from "@/util/types/Except";
import type { Position } from "grid-engine";

export const INITIAL_CURSOR_POSITION = { x: 150 } as const satisfies Except<Position, "y">;
