import type { PlayerInput } from "@/models/dungeons/UI/input/PlayerInput";
import type { PlayerSpecialInput } from "@/models/dungeons/UI/input/PlayerSpecialInput";

import { PlayerSpecialInputs } from "@/models/dungeons/UI/input/PlayerSpecialInput";

export const checkIsPlayerSpecialInput = (input: PlayerInput): input is PlayerSpecialInput =>
  PlayerSpecialInputs.has(input as PlayerSpecialInput);
