import type { PcmClip } from "#src/models/voiceMatch/PcmClip";

export interface ClipDecoder {
  // The clip's one channel, or nothing for bytes the converter rejects or that decode to no samples
  decode: (bytes: Uint8Array) => Promise<PcmClip | undefined>;
  free: () => void;
}
