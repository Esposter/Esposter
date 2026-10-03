import { GenshinVerb } from "../src/models/GenshinVerb";

// Each verb a person runs, as `/genshin-<verb>`, and what the command menu says of it; the authoring verbs are the
// `genshin-author` skill's and have no command
export const VerbDescriptionMap: Partial<Record<GenshinVerb, string>> = {
  [GenshinVerb.Language]:
    "Sets the language every word the plugin writes is in, and the reply language with it; given nothing, reports what is set.",
  [GenshinVerb.Mute]: "Stops replies' spoken lines being read aloud. The pick and the card are unaffected.",
  [GenshinVerb.Pin]: "Fixes one character for every session until unpinned, this one from this reply on.",
  [GenshinVerb.Reply]: "Sets the language replies are written in, on its own; given nothing, reports what is set.",
  [GenshinVerb.Roster]: "Every playable character, one line each.",
  [GenshinVerb.Status]: "Reports every setting the plugin holds and where each came from. Changes nothing.",
  [GenshinVerb.Teardown]:
    "Removes the voice's runtime, weights, references and dub; the picks, the pin and the languages stay.",
  [GenshinVerb.Today]: "The card of this session's character.",
  [GenshinVerb.Unmute]: "Lets replies' spoken lines be read aloud again.",
  [GenshinVerb.Unpin]: "Removes the pin; the pick decides again, for this session from this reply on.",
  [GenshinVerb.Use]: "Speaks as one character for this session alone, from this reply on.",
  [GenshinVerb.Voice]:
    "Sets up spoken replies in the character's own cloned voice, or switches the dub (en, ja, ko or zh); given nothing, reports what is installed.",
  [GenshinVerb.Volume]: "Sets how loud replies are spoken, as a whole number from 0 to 100.",
};

// The verbs that print a card, which the model answers as from the reply that relays it
export const CardVerbs: readonly GenshinVerb[] = [
  GenshinVerb.Language,
  GenshinVerb.Pin,
  GenshinVerb.Unpin,
  GenshinVerb.Use,
];
