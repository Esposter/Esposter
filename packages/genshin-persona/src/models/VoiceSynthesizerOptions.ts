import type { VoiceProgress } from "#src/models/VoiceProgress";

// What a load of the engine reports, and where on the device ladder it starts
export interface VoiceSynthesizerOptions {
  // Every move down the ladder, and a load that rejects, as one line each
  onFallback?: (message: string) => void;
  onProgress?: (progress: VoiceProgress) => void;
  // The rung to start on — the one the last synthesizer on this machine settled on — or the top for "" and for a
  // Name no rung carries
  rungName?: string;
}
