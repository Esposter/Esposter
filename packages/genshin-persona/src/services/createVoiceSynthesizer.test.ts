import type { SpeakerTensors } from "#src/models/SpeakerTensors";
import type { VoiceModel } from "#src/models/VoiceModel";
import type { VoiceModelOptions } from "#src/models/VoiceModelOptions";
import type { VoiceRuntime } from "#src/models/VoiceRuntime";
import type { VoiceTensor } from "#src/models/VoiceTensor";

import { VOICE_DEVICE_LADDER, VOICE_SAMPLE_RATE } from "#src/services/constants";
import { createVoiceSynthesizer } from "#src/services/createVoiceSynthesizer";
import { describe, expect, test, vi } from "vitest";

describe(createVoiceSynthesizer, () => {
  const modelsDirectory = "modelsDirectory";
  const text = "text";
  const tensor: VoiceTensor = { data: new Float32Array(), dims: [] };
  const speaker: SpeakerTensors = {
    audio_features: tensor,
    audio_tokens: tensor,
    speaker_embeddings: tensor,
    speaker_features: tensor,
  };
  // A tenth of a second: a burst with a pause after it, which is speech, and a constant near-silence, which is not
  const length = VOICE_SAMPLE_RATE / 10;
  const speech = Float32Array.from({ length }, (_, index) => (index < length / 2 ? 1 : 0));
  const silence = Float32Array.from({ length }, () => 0.001);
  // The engine as each rung loads it: the rung's vocoder answers every generation with the same waveform, and a
  // Rung with none rejects its load
  const getRuntime = (waveformByRung: (Float32Array | undefined)[]) => {
    const models = waveformByRung.map((waveform): VoiceModel => ({
      dispose: vi.fn<VoiceModel["dispose"]>(() => Promise.resolve([])),
      encode_speech: vi.fn<VoiceModel["encode_speech"]>(() => Promise.resolve(speaker)),
      generate: vi.fn<VoiceModel["generate"]>(() =>
        Promise.resolve({ data: waveform ?? new Float32Array(), dims: [] }),
      ),
    }));
    const from_pretrained = vi.fn<(modelId: string, options: VoiceModelOptions) => Promise<VoiceModel>>(
      (_, { device }) => {
        const rungIndex = VOICE_DEVICE_LADDER.findIndex((rung) => rung.devices === device);
        const model = models[rungIndex];
        return waveformByRung[rungIndex] && model
          ? Promise.resolve(model)
          : Promise.reject(new Error(`rung ${rungIndex}`));
      },
    );
    const runtime: VoiceRuntime = {
      AutoConfig: { from_pretrained: () => Promise.resolve({}) },
      AutoProcessor: { from_pretrained: () => Promise.resolve(() => Promise.resolve({})) },
      ChatterboxModel: { from_pretrained },
      env: { cacheDir: "" },
      Tensor: class {
        data: Float32Array;
        dims: number[];
        constructor(_: "float32", data: Float32Array, dims: number[]) {
          this.data = data;
          this.dims = dims;
        }
      },
    };
    return { from_pretrained, models, onFallback: vi.fn<(message: string) => void>(), runtime };
  };

  test("moves one rung down when a synthesis is not speech, releases the engine it left, and stays there", async () => {
    expect.hasAssertions();

    const { from_pretrained, models, onFallback, runtime } = getRuntime([silence, speech, speech]);
    const synthesizer = await createVoiceSynthesizer(runtime, modelsDirectory, { onFallback });

    await expect(synthesizer.synthesize(text, speaker)).resolves.toStrictEqual({
      sampleRate: VOICE_SAMPLE_RATE,
      samples: speech,
    });
    expect(synthesizer.device).toBe(VOICE_DEVICE_LADDER[1]?.name);
    expect(models[0]?.dispose).toHaveBeenCalledTimes(1);
    expect(onFallback).toHaveBeenCalledTimes(1);

    await synthesizer.synthesize(text, speaker);

    expect(from_pretrained).toHaveBeenCalledTimes(2);
    expect(models[1]?.generate).toHaveBeenCalledTimes(2);
  });

  test("walks past a rung whose load rejects", async () => {
    expect.hasAssertions();

    const { onFallback, runtime } = getRuntime([undefined, speech, speech]);
    const synthesizer = await createVoiceSynthesizer(runtime, modelsDirectory, { onFallback });

    expect(synthesizer.device).toBe(VOICE_DEVICE_LADDER[1]?.name);
    expect(onFallback).toHaveBeenCalledTimes(1);
  });

  test("starts on the rung named, walking past nothing above it", async () => {
    expect.hasAssertions();

    const rungName = VOICE_DEVICE_LADDER[1]?.name ?? "";
    const { from_pretrained, onFallback, runtime } = getRuntime([speech, speech, speech]);
    const synthesizer = await createVoiceSynthesizer(runtime, modelsDirectory, { onFallback, rungName });

    expect(synthesizer.device).toBe(rungName);
    expect(from_pretrained).toHaveBeenCalledTimes(1);
    expect(onFallback).toHaveBeenCalledTimes(0);
  });

  test("synthesizes nothing when the last rung returns silence too", async () => {
    expect.hasAssertions();

    const { onFallback, runtime } = getRuntime(VOICE_DEVICE_LADDER.map(() => silence));
    const synthesizer = await createVoiceSynthesizer(runtime, modelsDirectory, { onFallback });

    await expect(synthesizer.synthesize(text, speaker)).resolves.toBeUndefined();
    expect(onFallback).toHaveBeenCalledTimes(VOICE_DEVICE_LADDER.length);
  });
});
