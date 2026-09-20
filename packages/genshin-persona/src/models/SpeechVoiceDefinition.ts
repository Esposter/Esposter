// One voice as the service lists it, reduced to what a card can get wrong
export interface SpeechVoiceDefinition {
  name: string;
  // The styles this voice declares; empty for a voice that speaks in one register only
  styles: string[];
}
