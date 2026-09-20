import type { PcmClip } from "#src/models/PcmClip";

export interface ClipDecoder {
  // The clip's first channel, or nothing for bytes that decode to no samples
  decode: (bytes: Uint8Array) => Promise<PcmClip | undefined>;
  free: () => void;
}
