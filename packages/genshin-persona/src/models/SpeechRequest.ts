import type { SpeechVoice } from "#src/models/SpeechVoice";

export interface SpeechRequest {
  endpoint: string;
  key: string;
  text: string;
  voice: SpeechVoice;
  // A level the speech markup names or a whole number of its scale; "" for the service's default
  volume: string;
}
