import type { SpeechVoice } from "#src/models/SpeechVoice";
import type { SpinnerContent } from "#src/models/SpinnerContent";

// An authored card, split by who reads it. The habits, the greeting and the sign-off are the model's, and their
// Ceiling is about fifty tokens; the tips, the verbs and the voice are read by a person only and never reach the
// Model, so they cost no context at all
export interface PersonaCard extends SpinnerContent {
  // The one line a card performs rather than describes: hello, as the character would say it to the person
  greeting: string;
  // Three sentence fragments a model can apply to its own wording — a register, a recurring device, a verbal tic
  // Named rather than quoted
  habits: string[];
  // The closing turn of phrase
  signOff: string;
  // The ear's correction, and only that: a voice someone listened to and chose. The measured baseline for a
  // Character is the voice module the benchmark generates for them, and a card names a voice only to overrule it
  voice?: SpeechVoice;
}
