import type { Sound } from "#src/models/clicker/Sound";

import { SoundMap } from "#src/services/clicker/SoundMap";

export const useClickerSound = (sound: Sound) => useSound(SoundMap[sound]);
