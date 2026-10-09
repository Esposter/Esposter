import type { WeaponType } from "#src/models/weapon/WeaponType";

import characters from "#src/generated/stats/characters.json";
import { characterDataSchema } from "#src/models/character/CharacterData";
import { z } from "zod";

// Each roster character's kind of weapon, read off the game's character table as readStatTables checks it. A kit's tick
// Reads it synchronously, which readStatTables' on-demand import cannot give it, so the table is imported whole here. The
// Package's bundle already holds the table, so the import adds only the lookup
const CHARACTER_WEAPON_TYPE_MAP = new Map(
  z
    .array(characterDataSchema)
    .parse(characters)
    .map(({ id, weaponType }) => [id, weaponType]),
);

// The kind of weapon a character wields, or none for a character the table does not hold
export const getCharacterWeaponType = (characterId: number): undefined | WeaponType =>
  CHARACTER_WEAPON_TYPE_MAP.get(characterId);
