import type { VoiceModelConfig } from "#src/models/VoiceModelConfig";
import type { VoiceProgress } from "#src/models/VoiceProgress";

// A device and a dtype per component of the engine, keyed by the component's file name
export interface VoiceModelOptions {
  config: VoiceModelConfig;
  device: Record<string, string>;
  dtype: Record<string, string>;
  progress_callback?: (progress: VoiceProgress) => void;
}
