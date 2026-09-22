import type { Character } from "#src/models/Character";
import type { ChoiceResponse } from "@typesafe-ai/sdk";

// The character a session is given, and what the welcome may say about how: the tier's whole answer when the lore
// Pick chose, and why the tier did not answer when a key was set and the birthday pick stood in. A record, a pin
// And a keyless birthday pick carry neither
export interface SessionPick {
  character: Character;
  // "" unless a key was set and the tier did not answer
  loreFailure: string;
  loreResponse?: ChoiceResponse;
}
