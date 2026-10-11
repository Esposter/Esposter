import type { AccountCharacterPackFile } from "#src/models/character/AccountCharacterPackFile";

// A pack the player's account keeps, as the server lists it: its character, the hash of its files, its model's name and
// Each of its files, which is every file the pack's model and terms read
export interface AccountCharacterPack {
  characterId: number;
  files: AccountCharacterPackFile[];
  modelName: string;
  packHash: string;
}
