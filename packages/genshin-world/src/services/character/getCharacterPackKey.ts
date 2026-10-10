import { GameDataset } from "#src/models/data/GameDataset";

// The lock key a character's pack is published under, whose record lists the pack's files and is named by the hash its
// Files are stored under
export const getCharacterPackKey = (characterId: number): `${GameDataset.CharacterPacks}/${number}` =>
  `${GameDataset.CharacterPacks}/${characterId}`;
