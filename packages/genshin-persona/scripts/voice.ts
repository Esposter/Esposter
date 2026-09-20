import type { SpeakerTensors } from "#src/models/SpeakerTensors";
import type { SpeechRequest } from "#src/models/SpeechRequest";

import { VoiceRequestType } from "#src/models/VoiceRequestType";
import { VoiceStatus } from "#src/models/VoiceStatus";
import {
  MAX_VOLUME,
  MODELS_DIRECTORY,
  RUNTIME_MANIFEST_PATH,
  VOICE_IDLE_TIMEOUT_MS,
  VOICE_STATUS_SEPARATOR,
  WARM_TEXT,
} from "#src/services/constants";
import { createClipDecoder } from "#src/services/createClipDecoder";
import { createLatestWinsQueue } from "#src/services/createLatestWinsQueue";
import { createVoiceSynthesizer } from "#src/services/createVoiceSynthesizer";
import { getWavBytes } from "#src/services/getWavBytes";
import { listenVoiceSocket } from "#src/services/listenVoiceSocket";
import { parseVoiceRequest } from "#src/services/parseVoiceRequest";
import { playAudio } from "#src/services/playAudio";
import { readReferenceClip } from "#src/services/readReferenceClip";
import { readVoiceDevice } from "#src/services/readVoiceDevice";
import { readVoiceRuntime } from "#src/services/readVoiceRuntime";
import { writeVoiceDevice } from "#src/services/writeVoiceDevice";
import { writeVoiceLog } from "#src/services/writeVoiceLog";
import { createServer } from "node:net";

// The resident synthesizer: one process per machine holding the loaded engine, spoken to over the local socket by
// Every hook, exiting when idle. It binds the address before the engine loads so a second hook finds it taken
// Rather than loading a second engine, and a request that arrives during the load waits for it. Whatever fails
// Is written to the log, because the hooks stay silent on its behalf
const exit = (message: string) => {
  writeVoiceLog(message);
  process.exit(1);
};
process.on("uncaughtException", (error) => {
  exit(error.message);
});
process.on("unhandledRejection", (reason) => {
  exit(String(reason));
});

const server = createServer();
if (!(await listenVoiceSocket(server))) process.exit(0);

const idleTimer = setTimeout(() => {
  process.exit(0);
}, VOICE_IDLE_TIMEOUT_MS);
const runtime = readVoiceRuntime(RUNTIME_MANIFEST_PATH);
const decoder = await createClipDecoder();
// The engine starts on the rung the last synthesizer settled on, and the rung this one speaks on is kept for the
// Next — written once it has spoken there, since a load alone proves nothing about the sound
let settledDevice = readVoiceDevice();
const synthesizerLoad = createVoiceSynthesizer(runtime, MODELS_DIRECTORY, {
  onFallback: writeVoiceLog,
  rungName: settledDevice,
});
const speakers = new Map<string, SpeakerTensors>();
// The reference is fetched, decoded and encoded once per character, dub and line per process
const readSpeaker = async ({ language, name, stem }: SpeechRequest) => {
  const synthesizer = await synthesizerLoad;
  const key = [language, name, stem].join("/");
  const speaker = speakers.get(key);
  if (speaker) return speaker;

  const clip = await readReferenceClip(name, stem, language, decoder);
  if (!clip) return undefined;

  const encoded = await synthesizer.encodeReference(clip);
  speakers.set(key, encoded);
  return encoded;
};
const speak = async (request: SpeechRequest) => {
  const synthesizer = await synthesizerLoad;
  const speaker = await readSpeaker(request);
  if (!speaker) {
    writeVoiceLog(`no reference for ${request.name} in ${request.language}`);
    return VoiceStatus.Error;
  }

  const text = request.type === VoiceRequestType.Warm ? WARM_TEXT : request.text;
  const clip = await synthesizer.synthesize(text, speaker);
  if (!clip) return VoiceStatus.Error;

  if (synthesizer.device !== settledDevice) {
    settledDevice = synthesizer.device;
    writeVoiceDevice(settledDevice);
  }

  const { sampleRate, samples } = clip;
  if (request.type === VoiceRequestType.Speak) {
    const gain = request.volume / MAX_VOLUME;
    const playerFailure = playAudio(getWavBytes({ sampleRate, samples: samples.map((sample) => sample * gain) }));
    if (playerFailure) writeVoiceLog(`the player did not play: ${playerFailure}`);
  }

  return VoiceStatus.Ok;
};
// A synthesis that throws drops its request and keeps the engine: one sentence the model rejects does not cost
// A reload for the next
const queue = createLatestWinsQueue(async (request: SpeechRequest) => {
  const [outcome] = await Promise.allSettled([speak(request)]);
  if (outcome?.status === "fulfilled") return outcome.value;

  writeVoiceLog(`${request.type} failed: ${String(outcome?.reason)}`);
  return VoiceStatus.Error;
});
const handleLine = (line: string): Promise<VoiceStatus> => {
  const request = parseVoiceRequest(line);
  if (!request) return Promise.resolve(VoiceStatus.Error);

  idleTimer.refresh();
  if (request.type === VoiceRequestType.Stop) {
    setImmediate(() => {
      process.exit(0);
    });
    return Promise.resolve(VoiceStatus.Ok);
  }

  return queue(request);
};

server.on("connection", (socket) => {
  let buffer = "";
  socket.setEncoding("utf8");
  const answer = async (chunk: string) => {
    buffer += chunk;
    if (!buffer.includes("\n")) return;

    const [line = ""] = buffer.split("\n");
    buffer = "";
    // A line that is not JSON at all throws out of the parser synchronously, and `Promise.try` is what turns that
    // Into a rejection this answers with, rather than one nothing on the socket ever hears
    const [outcome] = await Promise.allSettled([Promise.try(() => handleLine(line))]);
    const status = outcome?.status === "fulfilled" ? outcome.value : VoiceStatus.Error;
    if (outcome?.status === "rejected") writeVoiceLog(`request failed: ${outcome.reason}`);
    const [load] = await Promise.allSettled([synthesizerLoad]);
    const device = load?.status === "fulfilled" ? load.value.device : "";
    socket.end(`${[status, device].filter(Boolean).join(VOICE_STATUS_SEPARATOR)}\n`);
  };
  // `socket.on` is a third-party slot that cannot be widened to take a promise, and `getSynchronizedFunction` —
  // The codebase's one sanctioned fire-and-forget — lives in the web app a shipped plugin cannot import from
  socket.on("data", (chunk: string) => {
    // oxlint-disable-next-line typescript/no-floating-promises -- `answer` settles every outcome a request has and ends the socket on each, so the only throw left in it is the log write, which the handler above already exits on
    answer(chunk);
  });
  // A hook that exited before reading its answer
  socket.on("error", () => {});
});

const [load] = await Promise.allSettled([synthesizerLoad]);
if (load?.status === "rejected") exit(`load failed: ${String(load.reason)}`);
