import type { Character } from "#src/models/character/Character";
import type { CharacterTalentKit } from "#src/models/character/CharacterTalentKit";
import type { Party } from "#src/models/party/Party";
import type { Ref } from "vue";

// What the expedition's roster is read from: the characters the player holds in the game's order, each one's name and
// Talent kit, and the party whose members are down
export interface WorldExpeditionRosterOptions {
  characters: Readonly<Ref<Character[]>>;
  characterTalentKits: CharacterTalentKit[];
  getCharacterName: (characterId: number) => string;
  party: Party;
}
