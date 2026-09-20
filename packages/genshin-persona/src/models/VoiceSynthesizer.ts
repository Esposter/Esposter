import type { PcmClip } from "#src/models/PcmClip";
import type { SpeakerTensors } from "#src/models/SpeakerTensors";

// The loaded engine: a reference encoded into the tensors a clone is conditioned on, and a sentence read from them
// — or nothing, when every rung of the device ladder returned silence for it
export interface VoiceSynthesizer {
  // The rung of the device ladder the engine runs on as of now — a synthesis can move it down — named for what
  // Runs on the GPU, since the CPU rungs speak slower and the person should know
  device: string;
  encodeReference: (clip: PcmClip) => Promise<SpeakerTensors>;
  synthesize: (text: string, speaker: SpeakerTensors) => Promise<PcmClip | undefined>;
}
