import type { Character } from "#src/models/character/Character";
import type { Kit } from "#src/models/kit/Kit";
import type { Party } from "#src/models/party/Party";

// The player's roster while a trial takes its place for the fight: the characters, the party and the kits the trial replaces,
// Held to be restored when the trial ends and saved in the trial's stead
export interface TrialRoster {
  characterIdKitMap: ReadonlyMap<number, Kit>;
  characters: Character[];
  party: Party;
}
