import type { Character } from "#src/models/Character";
import type { ChoiceResponse } from "@typesafe-ai/sdk";

// What one ask of the tier came to: the character it named with its whole answer, or why there is none — the
// Tier unreachable or a name the roster does not hold — for the welcome to say
export type LorePick = { character: Character; response: ChoiceResponse } | { failure: string };
