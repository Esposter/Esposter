import type { PlayerSpecialInput } from "#src/models/dungeons/UI/input/PlayerSpecialInput";
import type { Direction } from "grid-engine-headless";

export type PlayerInput = Direction | PlayerSpecialInput;
