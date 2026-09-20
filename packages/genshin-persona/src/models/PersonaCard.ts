import type { SpinnerContent } from "#src/models/SpinnerContent";

// An authored card, split by who reads it. The habits, the greeting and the sign-off are the model's, and their
// Ceiling is about fifty tokens; the tips, the verbs and the reference are read by a person only and never reach
// The model, so they cost no context at all
export interface PersonaCard extends SpinnerContent {
  // The one line a card performs rather than describes: hello, as the character would say it to the person
  greeting: string;
  // Three sentence fragments a model can apply to its own wording — a register, a recurring device, a verbal tic
  // Named rather than quoted
  habits: string[];
  // The ear's correction, and only that: the wiki file stem of the line the clone is conditioned on — the title
  // After the dub prefix and before the extension, the same in every dub — chosen by listening. The measured
  // Reference for every character is the generated `PersonaReferenceMap`, and a card names one only to overrule it
  reference?: string;
  // The closing turn of phrase
  signOff: string;
}
