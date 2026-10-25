import { TEXT_MAP_MIXER_ROTATION } from "#src/services/genshinText/constants";

export const rotateLeft = (value: bigint): bigint =>
  BigInt.asUintN(64, (value << TEXT_MAP_MIXER_ROTATION) | (value >> (64n - TEXT_MAP_MIXER_ROTATION)));
