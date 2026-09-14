import type { Sound } from "@/models/clicker/Sound";

import { SoundMap } from "@/services/clicker/SoundMap";

export const useClickerSound = (sound: Sound) => useSound(SoundMap[sound]);
