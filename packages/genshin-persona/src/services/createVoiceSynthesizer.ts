import type { LoadedVoiceModel } from "#src/models/LoadedVoiceModel";
import type { VoiceDeviceRung } from "#src/models/VoiceDeviceRung";
import type { VoiceRuntime } from "#src/models/VoiceRuntime";
import type { VoiceSynthesizer } from "#src/models/VoiceSynthesizer";
import type { VoiceSynthesizerOptions } from "#src/models/VoiceSynthesizerOptions";

import { checkIsSpeech } from "#src/services/checkIsSpeech";
import {
  UNBOUNDED_SPEECH_TOKENS,
  VOICE_DEVICE_LADDER,
  VOICE_MODEL_ARCHITECTURE,
  VOICE_MODEL_DTYPE,
  VOICE_MODEL_ID,
  VOICE_SAMPLE_RATE,
} from "#src/services/constants";

// The engine loaded once, its weights fetched into the models directory on the first load and read from there
// After, on the first rung of the device ladder that loads — from the rung named, when the last synthesizer on
// This machine settled on one, since the rungs above it were walked past already. Every synthesis is checked by
// Its sound: one that is not speech reloads the engine one rung down and runs again, since a provider can load a
// Graph and still run it wrong without a word, and the rung that spoke is the one every synthesis after it runs
// On. Which rung is reported, because the CPU rungs speak slower and the person should know; every move down is
// Reported as well
export const createVoiceSynthesizer = async (
  { AutoConfig, AutoProcessor, ChatterboxModel, env, Tensor }: VoiceRuntime,
  modelsDirectory: string,
  { onFallback, onProgress, rungName = "" }: VoiceSynthesizerOptions = {},
): Promise<VoiceSynthesizer> => {
  env.cacheDir = modelsDirectory;
  // The checkpoint's configuration names no architecture, and the runtime's progress tracker resolves the files to
  // Expect from one; named here, it expects the engine's four sessions rather than a single model file
  const config = await AutoConfig.from_pretrained(VOICE_MODEL_ID);
  config.architectures = [VOICE_MODEL_ARCHITECTURE];
  const loadRung = ({ devices }: VoiceDeviceRung) =>
    ChatterboxModel.from_pretrained(VOICE_MODEL_ID, {
      config,
      device: devices,
      dtype: VOICE_MODEL_DTYPE,
      progress_callback: onProgress,
    });
  // The engine on the first of these rungs that loads, with the rungs left below it; the bottom rung's rejection
  // Is the load's, with the reason the runtime gives
  const load = async (rung: VoiceDeviceRung, rungsBelow: VoiceDeviceRung[]): Promise<LoadedVoiceModel> => {
    const [nextRung, ...rungsBelowNext] = rungsBelow;
    if (!nextRung) return { model: await loadRung(rung), rung, rungsBelow };

    const [outcome] = await Promise.allSettled([loadRung(rung)]);
    if (outcome?.status === "fulfilled") return { model: outcome.value, rung, rungsBelow };

    onFallback?.(`${rung.name} did not load the engine: ${String(outcome?.reason)}`);
    return load(nextRung, rungsBelowNext);
  };
  const startIndex = Math.max(
    VOICE_DEVICE_LADDER.findIndex((rung) => rung.name === rungName),
    0,
  );
  const [startRung = VOICE_DEVICE_LADDER[0], ...lowerRungs] = VOICE_DEVICE_LADDER.slice(startIndex);
  let loaded = await load(startRung, lowerRungs);
  const processor = await AutoProcessor.from_pretrained(VOICE_MODEL_ID);

  return {
    get device() {
      return loaded.rung.name;
    },
    encodeReference: ({ samples }) => loaded.model.encode_speech(new Tensor("float32", samples, [1, samples.length])),
    synthesize: async (text, speaker) => {
      const inputs = await processor(text);
      for (;;) {
        const waveform = await loaded.model.generate({
          ...inputs,
          ...speaker,
          max_new_tokens: UNBOUNDED_SPEECH_TOKENS,
        });
        const clip = { sampleRate: VOICE_SAMPLE_RATE, samples: Float32Array.from(waveform.data) };
        if (checkIsSpeech(clip)) return clip;

        const [nextRung, ...rungsBelowNext] = loaded.rungsBelow;
        if (!nextRung) {
          onFallback?.(`${loaded.rung.name} synthesized silence, and no device rung is left below it`);
          return undefined;
        }

        onFallback?.(`${loaded.rung.name} synthesized silence; the engine moves one rung down`);
        await loaded.model.dispose();
        loaded = await load(nextRung, rungsBelowNext);
      }
    },
  };
};
