import type { PcmClip } from "#src/models/PcmClip";
import type { SpeakerTensors } from "#src/models/SpeakerTensors";

// The loaded engine: a reference encoded into the tensors a clone is conditioned on, and a sentence read from them
export interface VoiceSynthesizer {
  // What the language model and vocoder actually loaded on — the GPU, or the CPU fallback that speaks several
  // Times slower than real time
  device: string;
  encodeReference: (clip: PcmClip) => Promise<SpeakerTensors>;
  synthesize: (text: string, speaker: SpeakerTensors) => Promise<PcmClip>;
}
