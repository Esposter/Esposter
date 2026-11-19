import type { Sound } from "#src/models/clicker/Sound";

import { SoundUrlMap } from "#src/services/clicker/SoundUrlMap";

export const useClickerSound = (sound: Sound) => useSound(SoundUrlMap[sound]);
