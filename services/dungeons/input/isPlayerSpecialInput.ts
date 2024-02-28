import type { PlayerInput } from "@/models/dungeons/input/PlayerInput";
import { PlayerSpecialInput } from "@/models/dungeons/input/PlayerSpecialInput";

export const isPlayerSpecialInput = (input: PlayerInput): input is PlayerSpecialInput =>
  Object.values(PlayerSpecialInput).includes(input as PlayerSpecialInput);
