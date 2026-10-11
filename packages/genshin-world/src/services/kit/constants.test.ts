import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { NOELLE_CHARACTER_ID } from "#src/services/kit/characters/noelleKit";
import { RAIDEN_CHARACTER_ID } from "#src/services/kit/characters/raidenKit";
import { XIANGLING_CHARACTER_ID } from "#src/services/kit/characters/xianglingKit";
import { describe } from "vitest";

// The party the replay guard and the bench drive together, the kit framework's proof kits, Raiden on the field first
export const PROOF_PARTY_CHARACTER_IDS = [
  RAIDEN_CHARACTER_ID,
  XIANGLING_CHARACTER_ID,
  NOELLE_CHARACTER_ID,
  TRAVELER_CHARACTER_ID,
];

describe.todo("constants");
