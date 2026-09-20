import type { VoiceTensor } from "#src/models/VoiceTensor";

// A reference clip encoded once, spelled as the engine's speech encoder names its outputs; the whole object is
// Spread into every generation conditioned on it
export interface SpeakerTensors {
  audio_features: VoiceTensor;
  audio_tokens: VoiceTensor;
  speaker_embeddings: VoiceTensor;
  speaker_features: VoiceTensor;
}
