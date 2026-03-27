import type { PlayerInput } from "@/models/dungeons/UI/input/PlayerInput";

import { PlayerSpecialInputs } from "@/models/dungeons/UI/input/PlayerSpecialInput";

export const isPlayerSpecialInput = (input: PlayerInput): input is PlayerSpecialInput =>
  PlayerSpecialInputs.has(input as PlayerSpecialInput);
