import type { Except } from "@/util/types/Except";
import type { Position } from "grid-engine";

export const ATTACK_DISPLAY_LIMIT = 4;

export const ATTACK_NAME_POSITION_INCREMENT = { y: 80 } as const satisfies Except<Position, "x">;
