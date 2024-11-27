import type { Sound } from "@/models/clicker/Sound";

import { SoundMap } from "@/services/clicker/SoundMap";

export const useClickerSound = (sound: Sound, playOptions?: Parameters<typeof useSound>[1]) =>
  useSound(SoundMap[sound], playOptions);
