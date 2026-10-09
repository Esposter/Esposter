import type { SpeakerTensors } from "#src/models/SpeakerTensors";
import type { VoiceTensor } from "#src/models/VoiceTensor";

// The loaded engine as the runtime exposes it: a reference clip in, speaker tensors out; the processor's inputs
// And the speaker tensors in, a waveform out; its vocoder run on speech tokens made so far; and its sessions released,
// Before another load takes their place
export interface VoiceModel {
  dispose: () => Promise<void[]>;
  encode_speech: (audio: VoiceTensor) => Promise<SpeakerTensors>;
  generate: (inputs: Record<string, unknown>) => Promise<VoiceTensor>;
  sessions: {
    conditional_decoder: { run: (feeds: Record<string, VoiceTensor>) => Promise<{ waveform: VoiceTensor }> };
  };
}
