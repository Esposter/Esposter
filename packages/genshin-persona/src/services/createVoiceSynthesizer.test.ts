import type { PcmClip } from "#src/models/PcmClip";
import type { SpeakerTensors } from "#src/models/SpeakerTensors";
import type { VoiceModel } from "#src/models/VoiceModel";
import type { VoiceModelOptions } from "#src/models/VoiceModelOptions";
import type { VoiceRuntime } from "#src/models/VoiceRuntime";
import type { VoiceTensor } from "#src/models/VoiceTensor";

import {
  CHUNK_CROSSFADE_SECONDS,
  GPU_PROVIDER_FAILURE_REGEX,
  MAX_SPEECH_TOKENS_PER_CHARACTER,
  MIN_SPEECH_TOKEN_CEILING,
  VOICE_CHUNK_TOKENS,
  VOICE_GPU_DEVICE,
  VOICE_SAMPLE_RATE,
  VOICE_VOCODER_GPU_DEVICE,
} from "#src/services/constants";
import { createVoiceSynthesizer } from "#src/services/createVoiceSynthesizer";
import { getVoiceDeviceLadder } from "#src/services/getVoiceDeviceLadder";
import { describe, expect, test, vi } from "vitest";

// The runtime's tensor, reduced to the one field the plugin reads
class TestTensor {
  data: BigInt64Array | Float32Array;

  constructor(_type: string, data: BigInt64Array | Float32Array) {
    this.data = data;
  }
}

const concatenate = (parts: Float32Array[]) => {
  const joined = new Float32Array(parts.reduce((total, part) => total + part.length, 0));
  let offset = 0;
  for (const part of parts) {
    joined.set(part, offset);
    offset += part.length;
  }
  return joined;
};
const collect = async (stream: AsyncGenerator<PcmClip>) => {
  const chunks: Float32Array[] = [];
  for await (const clip of stream) chunks.push(clip.samples);
  return concatenate(chunks);
};

describe(createVoiceSynthesizer, () => {
  const modelsDirectory = "modelsDirectory";
  const deviceLadder = getVoiceDeviceLadder();
  const text = "text";
  const tensor: VoiceTensor = { data: new Float32Array() };
  const speaker: SpeakerTensors = {
    audio_features: tensor,
    audio_tokens: tensor,
    speaker_embeddings: tensor,
    speaker_features: tensor,
  };
  // A tenth of a second: a burst with a pause after it, which is speech, and a constant near-silence, which is not
  const length = VOICE_SAMPLE_RATE / 10;
  const speech = Float32Array.from({ length }, (_value, index) => (index < length / 2 ? 1 : 0));
  const silence = Float32Array.from({ length }, () => 0.001);
  // The engine as each rung loads it: the rung's vocoder answers every generation with the same waveform, a rung
  // Given an error rejects every generation with it, and a rung with none rejects its load
  const getRuntime = (rungWaveforms: (Error | Float32Array | undefined)[]) => {
    const models = rungWaveforms.map((waveform): VoiceModel => ({
      dispose: vi.fn<VoiceModel["dispose"]>(() => Promise.resolve([])),
      encode_speech: vi.fn<VoiceModel["encode_speech"]>(() => Promise.resolve(speaker)),
      generate: vi.fn<VoiceModel["generate"]>(() =>
        waveform instanceof Error
          ? Promise.reject(waveform)
          : Promise.resolve({ data: waveform ?? new Float32Array() }),
      ),
      sessions: {
        conditional_decoder: {
          run: vi.fn<VoiceModel["sessions"]["conditional_decoder"]["run"]>(() =>
            Promise.resolve({ waveform: { data: new Float32Array() } }),
          ),
        },
      },
    }));
    const from_pretrained = vi.fn<(modelId: string, options: VoiceModelOptions) => Promise<VoiceModel>>(
      (_modelId, { device }) => {
        const rungIndex = deviceLadder.findIndex((rung) => rung.devices === device);
        const model = models[rungIndex];
        return rungWaveforms[rungIndex] && model
          ? Promise.resolve(model)
          : Promise.reject(new Error(`rung ${rungIndex}`));
      },
    );
    const runtime: VoiceRuntime = {
      AutoConfig: { from_pretrained: () => Promise.resolve({}) },
      AutoProcessor: { from_pretrained: () => Promise.resolve(() => Promise.resolve({})) },
      ChatterboxModel: { from_pretrained },
      env: { cacheDir: "" },
      Tensor: TestTensor,
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
    expect(synthesizer.device).toBe(deviceLadder[1]?.name);
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

    expect(synthesizer.device).toBe(deviceLadder[1]?.name);
    expect(onFallback).toHaveBeenCalledTimes(1);
  });

  test("starts on the rung named, walking past nothing above it", async () => {
    expect.hasAssertions();

    const rungName = deviceLadder[1]?.name ?? "";
    const { from_pretrained, onFallback, runtime } = getRuntime([speech, speech, speech]);
    const synthesizer = await createVoiceSynthesizer(runtime, modelsDirectory, { onFallback, rungName });

    expect(synthesizer.device).toBe(rungName);
    expect(from_pretrained).toHaveBeenCalledTimes(1);
    expect(onFallback).toHaveBeenCalledTimes(0);
  });

  test.each([
    ["the floor for a short text", text, MIN_SPEECH_TOKEN_CEILING],
    [
      "in proportion to a long text",
      text.repeat(MIN_SPEECH_TOKEN_CEILING),
      text.length * MIN_SPEECH_TOKEN_CEILING * MAX_SPEECH_TOKENS_PER_CHARACTER,
    ],
  ])("caps the generation at %s", async (_case, spoken, ceiling) => {
    expect.hasAssertions();

    const { models, runtime } = getRuntime([speech, speech, speech]);
    const synthesizer = await createVoiceSynthesizer(runtime, modelsDirectory);
    await synthesizer.synthesize(spoken, speaker);

    expect(models[0]?.generate).toHaveBeenCalledExactlyOnceWith({ ...speaker, max_new_tokens: ceiling });
  });

  test("moves one rung down when the GPU provider fails a synthesis, and releases the engine it left", async () => {
    expect.hasAssertions();

    const failure = new Error(`providers/${VOICE_GPU_DEVICE}`);
    const { models, onFallback, runtime } = getRuntime([failure, speech, speech]);
    const synthesizer = await createVoiceSynthesizer(runtime, modelsDirectory, { onFallback });

    await expect(synthesizer.synthesize(text, speaker)).resolves.toStrictEqual({
      sampleRate: VOICE_SAMPLE_RATE,
      samples: speech,
    });
    expect(GPU_PROVIDER_FAILURE_REGEX.test(String(failure))).toBe(true);
    expect(GPU_PROVIDER_FAILURE_REGEX.test(`providers\\${VOICE_VOCODER_GPU_DEVICE}\\DmlExecutionProvider`)).toBe(true);
    expect(synthesizer.device).toBe(deviceLadder[1]?.name);
    expect(models[0]?.dispose).toHaveBeenCalledTimes(1);
    expect(onFallback).toHaveBeenCalledTimes(1);
  });

  test("synthesizes nothing, on the rung it is on, when any other provider fails a synthesis", async () => {
    expect.hasAssertions();

    const { models, onFallback, runtime } = getRuntime([new Error(" "), speech, speech]);
    const synthesizer = await createVoiceSynthesizer(runtime, modelsDirectory, { onFallback });

    await expect(synthesizer.synthesize(text, speaker)).resolves.toBeUndefined();
    expect(synthesizer.device).toBe(deviceLadder[0]?.name);
    expect(models[0]?.dispose).toHaveBeenCalledTimes(0);
    expect(onFallback).toHaveBeenCalledTimes(1);
  });

  test("synthesizes nothing when the last rung returns silence too", async () => {
    expect.hasAssertions();

    const { onFallback, runtime } = getRuntime(deviceLadder.map(() => silence));
    const synthesizer = await createVoiceSynthesizer(runtime, modelsDirectory, { onFallback });

    await expect(synthesizer.synthesize(text, speaker)).resolves.toBeUndefined();
    expect(onFallback).toHaveBeenCalledTimes(deviceLadder.length);
  });

  // Each speech token is vocoded to one frame of audio, the frame alternating between speech and near-silence, so a
  // Chunk of any length has both and passes the speech check; the decoder pads with three silence tokens
  const SAMPLES_PER_TOKEN = 960;
  const QUIET = 0.001;
  const SILENCE_TOKEN_COUNT = 3;
  const streamTokenCount = VOICE_CHUNK_TOKENS * 2 + 4;
  const label = "reply m, line 1";
  const seamSamples = VOICE_SAMPLE_RATE * CHUNK_CROSSFADE_SECONDS;
  const signalAt = (index: number) => (Math.floor(index / SAMPLES_PER_TOKEN) % 2 === 0 ? 1 : QUIET);
  const getSignal = (count: number) => Float32Array.from({ length: count }, (_value, index) => signalAt(index));
  const getQuiet = (count: number) => Float32Array.from({ length: count }, () => QUIET);

  // The engine's generation streams one token a step, the decoder vocodes the tokens it is handed, and the decoder
  // Goes silent from its `silentFrom`-th run on, so a chunk after that is not speech
  const getStreamRuntime = (silentFrom: number) => {
    let decodeCount = 0;
    // A pass is its speech followed by the decoder's silence, the way the engine pads the tokens it is handed
    const run = vi.fn<VoiceModel["sessions"]["conditional_decoder"]["run"]>(({ speech_tokens }) => {
      decodeCount += 1;
      const passLength = speech_tokens?.data.length ?? 0;
      const speechLength = (passLength - SILENCE_TOKEN_COUNT) * SAMPLES_PER_TOKEN;
      const data =
        decodeCount >= silentFrom
          ? getQuiet(passLength * SAMPLES_PER_TOKEN)
          : concatenate([getSignal(speechLength), getQuiet(SILENCE_TOKEN_COUNT * SAMPLES_PER_TOKEN)]);
      return Promise.resolve({ waveform: { data } });
    });
    const generate = vi.fn<VoiceModel["generate"]>(async (inputs) => {
      const { end, put } = inputs.streamer as { end: () => void; put: (rows: bigint[][]) => void };
      put([[0n]]);
      for (let token = 1; token <= streamTokenCount; token += 1) {
        put([[BigInt(token)]]);
        // oxlint-disable-next-line no-await-in-loop -- Each token is streamed before the next is made, as the engine makes them
        await new Promise((resolve) => {
          setImmediate(resolve);
        });
      }
      end();
      return { data: getSignal(streamTokenCount * SAMPLES_PER_TOKEN) };
    });
    const model: VoiceModel = {
      dispose: vi.fn<VoiceModel["dispose"]>(() => Promise.resolve([])),
      encode_speech: vi.fn<VoiceModel["encode_speech"]>(() => Promise.resolve(speaker)),
      generate,
      sessions: { conditional_decoder: { run } },
    };
    const runtime: VoiceRuntime = {
      AutoConfig: { from_pretrained: () => Promise.resolve({}) },
      AutoProcessor: { from_pretrained: () => Promise.resolve(() => Promise.resolve({})) },
      ChatterboxModel: { from_pretrained: () => Promise.resolve(model) },
      env: { cacheDir: "" },
      Tensor: TestTensor,
    };
    return { onFallback: vi.fn<(message: string) => void>(), runtime };
  };

  test("emits the sentence's audio in order, each sample once, as chunks", async () => {
    expect.hasAssertions();

    const { onFallback, runtime } = getStreamRuntime(Number.POSITIVE_INFINITY);
    const synthesizer = await createVoiceSynthesizer(runtime, modelsDirectory, { onFallback });
    const chunks: Float32Array[] = [];
    for await (const clip of synthesizer.streamSpeech(text, speaker, label, () => false)) chunks.push(clip.samples);

    expect(chunks.length).toBeGreaterThan(1);
    expect(concatenate(chunks)).toStrictEqual(getSignal(streamTokenCount * SAMPLES_PER_TOKEN));
    expect(onFallback).toHaveBeenCalledTimes(0);
  });

  test("drops the rest of the sentence at a chunk that is not speech, and moves the ladder down once", async () => {
    expect.hasAssertions();

    const { onFallback, runtime } = getStreamRuntime(2);
    const synthesizer = await createVoiceSynthesizer(runtime, modelsDirectory, { onFallback });

    // The first chunk stops at its seam, which the next chunk would have faded into
    await expect(collect(synthesizer.streamSpeech(text, speaker, label, () => false))).resolves.toStrictEqual(
      getSignal(VOICE_CHUNK_TOKENS * SAMPLES_PER_TOKEN - seamSamples),
    );
    expect(synthesizer.device).toBe(deviceLadder[1]?.name);
    expect(onFallback).toHaveBeenCalledExactlyOnceWith(expect.stringContaining(`${label}, chunk 2`));
  });
});
