import type { LoadedVoiceModel } from "#src/models/LoadedVoiceModel";
import type { PcmClip } from "#src/models/PcmClip";
import type { SpeakerTensors } from "#src/models/SpeakerTensors";
import type { VoiceDeviceRung } from "#src/models/VoiceDeviceRung";
import type { VoiceRuntime } from "#src/models/VoiceRuntime";
import type { VoiceSynthesizer } from "#src/models/VoiceSynthesizer";
import type { VoiceSynthesizerOptions } from "#src/models/VoiceSynthesizerOptions";
import type { VoiceTensor } from "#src/models/VoiceTensor";

import { checkIsSpeech } from "#src/services/checkIsSpeech";
import {
  CHUNK_CROSSFADE_SECONDS,
  FRAME_SECONDS,
  GPU_PROVIDER_FAILURE_REGEX,
  MAX_SPEECH_TOKENS_PER_CHARACTER,
  MIN_SPEECH_TOKEN_CEILING,
  VOICE_CHUNK_TOKENS,
  VOICE_DECODER_SILENCE_TOKEN_COUNT,
  VOICE_MODEL_ARCHITECTURE,
  VOICE_MODEL_DTYPE,
  VOICE_MODEL_ID,
  VOICE_SAMPLE_RATE,
  VOICE_STOP_SPEECH_TOKEN,
} from "#src/services/constants";
import { createChunkSplicer } from "#src/services/createChunkSplicer";
import { deleteSupersededModels } from "#src/services/deleteSupersededModels";
import { getVoiceDeviceLadder } from "#src/services/getVoiceDeviceLadder";
import { vocodeSpeechTokens } from "#src/services/vocodeSpeechTokens";

// Thrown into the generation when its line is dropped, so the language model stops at its next token
const STREAM_ABORTED_MESSAGE = "the line was dropped, so its generation stops";
const CHUNK_OVERLAP_SAMPLES = Math.round(VOICE_SAMPLE_RATE * CHUNK_CROSSFADE_SECONDS);
// A chunk's own audio shorter than one analysis frame is a tail of the sentence, which cannot be judged for speech
const MIN_CHECKED_SAMPLES = Math.round(VOICE_SAMPLE_RATE * FRAME_SECONDS);

// The engine on the first rung of the device ladder that loads, from the rung named; a synthesis that is not speech,
// Or one the GPU provider fails, reloads one rung down and runs again, since a provider can load a graph and still run
// It wrong without a word, and can lose its device with one
export const createVoiceSynthesizer = async (
  { AutoConfig, AutoProcessor, ChatterboxModel, env, Tensor }: VoiceRuntime,
  modelsDirectory: string,
  { onFallback, onProgress, rungName = "" }: VoiceSynthesizerOptions = {},
): Promise<VoiceSynthesizer> => {
  env.cacheDir = modelsDirectory;
  deleteSupersededModels(modelsDirectory);
  // The checkpoint's configuration names no architecture, and the runtime's progress tracker resolves the files to
  // Expect from one; named here, it expects the engine's four sessions rather than a single model file
  const modelConfiguration = await AutoConfig.from_pretrained(VOICE_MODEL_ID);
  modelConfiguration.architectures = [VOICE_MODEL_ARCHITECTURE];
  const loadRung = ({ devices }: VoiceDeviceRung) =>
    ChatterboxModel.from_pretrained(VOICE_MODEL_ID, {
      config: modelConfiguration,
      device: devices,
      dtype: VOICE_MODEL_DTYPE,
      progress_callback: onProgress,
    });
  // The bottom rung's rejection is the load's, with the reason the runtime gives
  const load = async (rung: VoiceDeviceRung, rungsBelow: VoiceDeviceRung[]): Promise<LoadedVoiceModel> => {
    const [nextRung, ...rungsBelowNext] = rungsBelow;
    if (!nextRung) return { model: await loadRung(rung), rung, rungsBelow };

    const [outcome] = await Promise.allSettled([loadRung(rung)]);
    if (outcome?.status === "fulfilled") return { model: outcome.value, rung, rungsBelow };

    onFallback?.(`${rung.name} did not load the engine: ${String(outcome?.reason)}`);
    return load(nextRung, rungsBelowNext);
  };
  const deviceLadder = getVoiceDeviceLadder();
  const startIndex = Math.max(
    deviceLadder.findIndex((rung) => rung.name === rungName),
    0,
  );
  const [startRung = deviceLadder[0], ...lowerRungs] = deviceLadder.slice(startIndex);
  let loaded = await load(startRung, lowerRungs);
  const processor = await AutoProcessor.from_pretrained(VOICE_MODEL_ID);
  // One rung down, or false from the bottom rung
  const stepDown = async (failure: string) => {
    const [nextRung, ...rungsBelowNext] = loaded.rungsBelow;
    if (!nextRung) {
      onFallback?.(`${loaded.rung.name} ${failure}, and no device rung is left below it`);
      return false;
    }

    onFallback?.(`${loaded.rung.name} ${failure}; the engine moves one rung down`);
    // A provider that lost its device may not release what it held; the rung below loads either way
    await Promise.allSettled([loaded.model.dispose()]);
    loaded = await load(nextRung, rungsBelowNext);
    return true;
  };

  // The sentence as its speech tokens are made: every VOICE_CHUNK_TOKENS the tokens so far are vocoded and their new
  // Audio yielded while the generation runs on beside it. The generation's own final waveform is the last chunk, since
  // It vocodes everything anyway. A chunk that fails moves the ladder down and ends the sentence, dropping its rest
  const streamSpeech = async function* (
    text: string,
    speaker: SpeakerTensors,
    label: string,
    checkIsCancelled: () => boolean,
  ): AsyncGenerator<PcmClip> {
    const { model } = loaded;
    const inputs = await processor(text);
    const tokens: bigint[] = [];
    let isPrompt = true;
    // Set when this sentence is dropped inside the loop, so the generation stops at its next token as a cancel does
    let isDropped = false;
    let changed = Promise.withResolvers<void>();
    const notify = () => {
      changed.resolve();
      changed = Promise.withResolvers<void>();
    };
    const streamer = {
      // The generation's own final pass follows the end, and its waveform arrives through the generation below
      end: () => {},
      // Called with the prompt first, then with the one token each step makes, as a row of one
      put: (rows: bigint[][]) => {
        // The plugin ships without `@esposter/shared`, so its InvalidOperationError is out of reach here
        // oxlint-disable-next-line error-handling/no-bare-error -- the stop is the generation's own, carrying no operation
        if (isDropped || checkIsCancelled()) throw new Error(STREAM_ABORTED_MESSAGE);
        if (isPrompt) {
          isPrompt = false;
          return;
        }

        for (const row of rows) tokens.push(...row);
        notify();
      },
    };
    const generation: { outcome?: PromiseSettledResult<VoiceTensor> } = {};
    // The generation settles into `outcome` and wakes the loop. A sentence dropped mid-generation waits on it before the
    // Ladder moves down, since moving down disposes the model the generation still runs on
    const generationSettled = (async () => {
      const [outcome] = await Promise.allSettled([
        model.generate({
          ...inputs,
          ...speaker,
          max_new_tokens: Math.max(MIN_SPEECH_TOKEN_CEILING, text.length * MAX_SPEECH_TOKENS_PER_CHARACTER),
          streamer,
        }),
      ]);
      generation.outcome = outcome;
      notify();
    })();
    const splice = createChunkSplicer(CHUNK_OVERLAP_SAMPLES);
    let decodedCount = 0;
    let chunkIndex = 0;
    // A chunk's audio past the seam, checked for speech on its own samples: a failure moves the ladder down and ends
    // The sentence. A chunk with no samples of its own is only a seam's tail, which is not checked
    const takeChunk = async (
      waveform: Float32Array,
      isFinal: boolean,
      speechShare: number,
    ): Promise<{ clip?: PcmClip; isFailed: boolean }> => {
      chunkIndex += 1;
      const { bodyLength, samples } = splice(waveform, isFinal, speechShare);
      if (samples.length === 0) return { isFailed: false };

      const clip = { sampleRate: VOICE_SAMPLE_RATE, samples };
      const body = samples.subarray(samples.length - bodyLength);
      if (bodyLength < MIN_CHECKED_SAMPLES || checkIsSpeech({ sampleRate: VOICE_SAMPLE_RATE, samples: body }))
        return { clip, isFailed: false };

      isDropped = true;
      await generationSettled;
      await stepDown(`synthesized silence on ${label}, chunk ${chunkIndex}`);
      return { isFailed: true };
    };
    const failGeneration = async (reason: string) => {
      if (GPU_PROVIDER_FAILURE_REGEX.test(reason)) await stepDown(`failed on the GPU on ${label}`);
      else onFallback?.(`${loaded.rung.name} did not read ${label}: ${reason}`);
    };
    for (;;) {
      const { outcome } = generation;
      if (outcome) break;

      if (tokens.length - decodedCount >= VOICE_CHUNK_TOKENS) {
        decodedCount = tokens.length;
        const prefix = tokens.slice(0, decodedCount).filter((token) => token !== VOICE_STOP_SPEECH_TOKEN);
        // oxlint-disable-next-line no-await-in-loop -- Each chunk is vocoded after the one before it is yielded
        const [vocoded] = await Promise.allSettled([vocodeSpeechTokens(model, Tensor, speaker, prefix)]);
        if (vocoded?.status === "rejected") {
          isDropped = true;
          // oxlint-disable-next-line no-await-in-loop -- The sentence ends at its first failure, so nothing follows this
          await generationSettled;
          // oxlint-disable-next-line no-await-in-loop -- The sentence ends at its first failure, so nothing follows this
          await failGeneration(String(vocoded.reason));
          return;
        }

        const speechShare = prefix.length / (prefix.length + VOICE_DECODER_SILENCE_TOKEN_COUNT);
        // oxlint-disable-next-line no-await-in-loop -- Each chunk is vocoded after the one before it is yielded
        const result = await takeChunk(
          vocoded?.status === "fulfilled" ? vocoded.value : new Float32Array(0),
          false,
          speechShare,
        );
        if (result.isFailed) return;

        if (result.clip) yield result.clip;
        continue;
      }

      // oxlint-disable-next-line no-await-in-loop -- Waiting for the next token or the generation's end is the loop's one wait
      await changed.promise;
    }

    const { outcome } = generation;
    if (outcome?.status === "rejected") {
      await failGeneration(String(outcome.reason));
      return;
    }

    // The generation's own waveform is the whole sentence, so its last chunk is what is left past the seam
    const result = await takeChunk(
      outcome?.status === "fulfilled" ? Float32Array.from(outcome.value.data, Number) : new Float32Array(0),
      true,
      1,
    );
    if (result.clip) yield result.clip;
  };

  return {
    get device() {
      return loaded.rung.name;
    },
    encodeReference: ({ samples }) => loaded.model.encode_speech(new Tensor("float32", samples, [1, samples.length])),
    streamSpeech,
    synthesize: async (text, speaker) => {
      const inputs = await processor(text);
      for (;;) {
        // oxlint-disable-next-line no-await-in-loop -- Retry: a rung is tried only because the one above it failed or went silent
        const [outcome] = await Promise.allSettled([
          loaded.model.generate({
            ...inputs,
            ...speaker,
            max_new_tokens: Math.max(MIN_SPEECH_TOKEN_CEILING, text.length * MAX_SPEECH_TOKENS_PER_CHARACTER),
          }),
        ]);
        if (outcome?.status === "rejected") {
          const reason = String(outcome.reason);
          // The bottom rung runs nothing on the GPU, so a failure the GPU provider raises always has a rung below
          // oxlint-disable-next-line no-await-in-loop -- Retry: a rung is tried only because the one above it failed or went silent
          if (GPU_PROVIDER_FAILURE_REGEX.test(reason) && (await stepDown("failed on the GPU"))) continue;

          onFallback?.(`${loaded.rung.name} did not read the line: ${reason}`);
          return undefined;
        }

        const clip = { sampleRate: VOICE_SAMPLE_RATE, samples: Float32Array.from(outcome.value.data, Number) };
        if (checkIsSpeech(clip)) return clip;
        // oxlint-disable-next-line no-await-in-loop -- Retry: a rung is tried only because the one above it failed or went silent
        if (!(await stepDown("synthesized silence"))) return undefined;
      }
    },
  };
};
