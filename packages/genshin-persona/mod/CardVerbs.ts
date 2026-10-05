import { GenshinVerb } from "../src/models/GenshinVerb";

// The verbs that print a card, which the model answers as from the reply that relays it
export const CardVerbs: readonly GenshinVerb[] = [
  GenshinVerb.Language,
  GenshinVerb.Pin,
  GenshinVerb.Unpin,
  GenshinVerb.Use,
];
