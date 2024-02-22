import type { PlayerSpecialInput } from "@/models/dungeons/input/PlayerSpecialInput";
import type { Direction } from "grid-engine";

export type PlayerInput = PlayerSpecialInput | Direction;
