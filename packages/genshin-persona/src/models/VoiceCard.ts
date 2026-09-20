import type { SpeechVoice } from "#src/models/SpeechVoice";

// An authored card split by reader: the context is the model's, the rest is the person's and never reaches it
export interface VoiceCard {
  // The habits, the greeting and the sign-off, as the file holds them; "" when the character has no card
  context: string;
  greeting: string;
  // Lines the spinner shows while a turn runs, in the character's voice
  tips: string[];
  // Gerunds the spinner shows while a turn runs, in the character's occupation
  verbs: string[];
  // How the reply is read aloud; a nameless voice is a card that set none, and the configured voice stands in
  voice: SpeechVoice;
}
