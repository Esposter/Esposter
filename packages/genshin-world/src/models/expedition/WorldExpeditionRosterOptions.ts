import type { CharacterTalentKit } from "#src/models/character/CharacterTalentKit";

// What the expedition's roster is read from: the characters the player holds in the game's order, and each one's name
// And talent kit
export interface WorldExpeditionRosterOptions {
  characterTalentKits: CharacterTalentKit[];
  getCharacterName: (characterId: number) => string;
}
