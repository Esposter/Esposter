import type { CharacterTalentKit } from "#src/models/character/CharacterTalentKit";

// What the expedition's roster is read from: the characters the player holds in the game's order, each one's name and
// Talent kit, and the party whose members are down
export interface WorldExpeditionRosterOptions {
  characterTalentKits: CharacterTalentKit[];
  getCharacterName: (characterId: number) => string;
}
