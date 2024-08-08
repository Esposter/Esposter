import type { PlayerInput } from "@/models/dungeons/UI/input/PlayerInput";

import { PlayerSpecialInput } from "@/models/dungeons/UI/input/PlayerSpecialInput";

export const isPlayerSpecialInput = (input: PlayerInput): input is PlayerSpecialInput =>
  Object.values(PlayerSpecialInput).includes(input as PlayerSpecialInput);
