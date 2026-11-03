import type { CharacterTalentKit } from "#src/models/character/CharacterTalentKit";

// What the expedition's roster is read from: the characters the player holds in the game's order, and each one's talent
// Talent kit and name
export interface WorldExpeditionRosterOptions {
  characterTalentKits: CharacterTalentKit[];
  getCharacterName: (characterId: number) => string;
}
