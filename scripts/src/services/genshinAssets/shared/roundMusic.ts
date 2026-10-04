import { MUSIC_DECIMALS } from "#src/services/genshinAssets/shared/constants";

// A fitted value of the music kept to `MUSIC_DECIMALS`, as every value `music.json` holds is
export const roundMusic = (value: number): number => Number(value.toFixed(MUSIC_DECIMALS));
