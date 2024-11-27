import buy from "@/assets/clicker/sound/buy.mp3";
import { Sound } from "@/models/clicker/Sound";

export const SoundMap = {
  [Sound.Buy]: buy,
} as const satisfies Record<Sound, string>;
