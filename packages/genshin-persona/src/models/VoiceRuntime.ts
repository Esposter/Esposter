import type { VoiceModel } from "#src/models/VoiceModel";
import type { VoiceModelConfig } from "#src/models/VoiceModelConfig";
import type { VoiceModelOptions } from "#src/models/VoiceModelOptions";
import type { VoiceProcessor } from "#src/models/VoiceProcessor";
import type { VoiceTensor } from "#src/models/VoiceTensor";

// The surface of the engine's runtime the plugin reads, spelled as the package spells it. Modelled here rather
// Than imported because the package is installed by the `voice` verb into the state directory and never declared
// By the plugin, so its own types are out of reach where this is type-checked
export interface VoiceRuntime {
  AutoConfig: { from_pretrained: (modelId: string) => Promise<VoiceModelConfig> };
  AutoProcessor: { from_pretrained: (modelId: string) => Promise<VoiceProcessor> };
  ChatterboxModel: { from_pretrained: (modelId: string, options: VoiceModelOptions) => Promise<VoiceModel> };
  env: { cacheDir: string };
  Tensor: new (type: "float32", data: Float32Array, dims: number[]) => VoiceTensor;
}
