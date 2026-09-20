import type { VoiceProgress } from "#src/models/VoiceProgress";
import type { VoiceRuntime } from "#src/models/VoiceRuntime";
import type { VoiceSynthesizer } from "#src/models/VoiceSynthesizer";

import {
  MAX_SPEECH_TOKENS,
  VOICE_CPU_DEVICE,
  VOICE_ENCODER_COMPONENT,
  VOICE_GPU_DEVICE,
  VOICE_MODEL_ARCHITECTURE,
  VOICE_MODEL_DTYPE,
  VOICE_MODEL_ID,
  VOICE_SAMPLE_RATE,
} from "#src/services/constants";

const getDeviceMap = (device: string) =>
  Object.fromEntries(
    Object.keys(VOICE_MODEL_DTYPE).map((component) => [
      component,
      component === VOICE_ENCODER_COMPONENT ? VOICE_CPU_DEVICE : device,
    ]),
  );

// The engine loaded once, its weights fetched into the models directory on the first load and read from there
// After. The GPU is tried first and the CPU is the fallback when no adapter is found, and which one loaded is
// Reported, because a CPU fallback speaks several times slower than real time and the person should know
export const createVoiceSynthesizer = async (
  { AutoConfig, AutoProcessor, ChatterboxModel, env, Tensor }: VoiceRuntime,
  modelsDirectory: string,
  onProgress?: (progress: VoiceProgress) => void,
): Promise<VoiceSynthesizer> => {
  env.cacheDir = modelsDirectory;
  // The checkpoint's configuration names no architecture, and the runtime's progress tracker resolves the files to
  // Expect from one; named here, it expects the engine's four sessions rather than a single model file
  const config = await AutoConfig.from_pretrained(VOICE_MODEL_ID);
  config.architectures = [VOICE_MODEL_ARCHITECTURE];
  const loadModel = (device: string) =>
    ChatterboxModel.from_pretrained(VOICE_MODEL_ID, {
      config,
      device: getDeviceMap(device),
      dtype: VOICE_MODEL_DTYPE,
      progress_callback: onProgress,
    });
  const [gpuLoad] = await Promise.allSettled([loadModel(VOICE_GPU_DEVICE)]);
  const device = gpuLoad?.status === "fulfilled" ? VOICE_GPU_DEVICE : VOICE_CPU_DEVICE;
  const model = gpuLoad?.status === "fulfilled" ? gpuLoad.value : await loadModel(VOICE_CPU_DEVICE);
  const processor = await AutoProcessor.from_pretrained(VOICE_MODEL_ID);

  return {
    device,
    encodeReference: ({ samples }) => model.encode_speech(new Tensor("float32", samples, [1, samples.length])),
    synthesize: async (text, speaker) => {
      const inputs = await processor(text);
      const waveform = await model.generate({ ...inputs, ...speaker, max_new_tokens: MAX_SPEECH_TOKENS });
      return { sampleRate: VOICE_SAMPLE_RATE, samples: Float32Array.from(waveform.data) };
    },
  };
};
