import type { SpeakerTensors } from "#src/models/SpeakerTensors";
import type { VoiceTensor } from "#src/models/VoiceTensor";

// The loaded engine as the runtime exposes it: a reference clip in, speaker tensors out; the processor's inputs
// And the speaker tensors in, a waveform out; and its sessions released, before another load takes their place
export interface VoiceModel {
  dispose: () => Promise<void[]>;
  encode_speech: (audio: VoiceTensor) => Promise<SpeakerTensors>;
  generate: (inputs: Record<string, unknown>) => Promise<VoiceTensor>;
}
