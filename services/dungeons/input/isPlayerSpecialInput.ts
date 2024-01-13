import { PlayerSpecialInput } from "@/models/dungeons/input/PlayerSpecialInput";

export const isPlayerSpecialInput = (input: string): input is PlayerSpecialInput =>
  Object.values(PlayerSpecialInput).includes(input as PlayerSpecialInput);
