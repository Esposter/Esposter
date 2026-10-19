import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { NOELLE_CHARACTER_ID } from "#src/services/kit/characters/noelleKit";
import { RAIDEN_CHARACTER_ID } from "#src/services/kit/characters/raidenKit";
import { XIANGLING_CHARACTER_ID } from "#src/services/kit/characters/xianglingKit";
import { describe } from "vitest";

// The party the bench drives, the kit framework's proof kits, Raiden on the field first
export const PROOF_PARTY_CHARACTER_IDS = [
  RAIDEN_CHARACTER_ID,
  XIANGLING_CHARACTER_ID,
  NOELLE_CHARACTER_ID,
  TRAVELER_CHARACTER_ID,
];
// The other party member a suite deploys beside its wielder, a character other than the wielder
export const OTHER_CHARACTER_ID = 1;
// The third party member a suite deploys beside its wielder and the other member, a character other than both
export const THIRD_CHARACTER_ID = 3;

describe.todo("constants");
