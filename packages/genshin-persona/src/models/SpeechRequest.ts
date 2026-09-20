export interface SpeechRequest {
  endpoint: string;
  key: string;
  text: string;
  voice: string;
  // A level the speech markup names or a whole number of its scale; "" for the service's default
  volume: string;
}
