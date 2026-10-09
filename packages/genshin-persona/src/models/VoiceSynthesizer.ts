import type { PcmClip } from "#src/models/PcmClip";
import type { SpeakerTensors } from "#src/models/SpeakerTensors";

// The loaded engine: a reference encoded into the tensors a clone is conditioned on, and a sentence read from them
// — whole, or as chunks while its speech tokens are made — or nothing, when every rung of the device ladder returned
// Silence for it
export interface VoiceSynthesizer {
  // The rung of the device ladder the engine runs on as of now — a synthesis can move it down — named for what
  // Runs on the GPU, since the CPU rungs speak slower and the person should know
  device: string;
  encodeReference: (clip: PcmClip) => Promise<SpeakerTensors>;
  // The sentence's audio in order, each chunk as its speech tokens are vocoded; a chunk that is not speech moves the
  // Ladder down and ends the sentence, which is cut where it stood. The label names the reply in the log, and the
  // Generation stops at its next token once `checkIsCancelled` says so
  streamSpeech: (
    text: string,
    speaker: SpeakerTensors,
    label: string,
    checkIsCancelled: () => boolean,
  ) => AsyncGenerator<PcmClip>;
  synthesize: (text: string, speaker: SpeakerTensors) => Promise<PcmClip | undefined>;
}
