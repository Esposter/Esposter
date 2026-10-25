import {
  TEXT_MAP_MIXER_FIRST_ADDEND,
  TEXT_MAP_MIXER_FIRST_MULTIPLIER,
  TEXT_MAP_MIXER_SECOND_ADDEND,
  TEXT_MAP_MIXER_SECOND_MULTIPLIER,
  TEXT_MAP_MIXER_THIRD_MULTIPLIER,
  TEXT_MAP_MIXER_XOR,
} from "#src/services/genshinText/constants";
import { rotateLeft } from "#src/services/genshinText/rotateLeft";

// The devkit's 64-bit mixer: its last XOR is the one constant that differs between the key and the length
export const mix64 = (value: bigint, finish: bigint): bigint => {
  let state = BigInt.asUintN(64, value * TEXT_MAP_MIXER_FIRST_MULTIPLIER + TEXT_MAP_MIXER_FIRST_ADDEND);
  state = rotateLeft(state);
  state = BigInt.asUintN(64, state * TEXT_MAP_MIXER_SECOND_MULTIPLIER + TEXT_MAP_MIXER_SECOND_ADDEND);
  state ^= TEXT_MAP_MIXER_XOR;
  state = rotateLeft(state);
  state = BigInt.asUintN(64, state * TEXT_MAP_MIXER_THIRD_MULTIPLIER);
  return state ^ finish;
};
