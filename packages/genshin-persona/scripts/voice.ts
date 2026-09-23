import type { AudioPlayer } from "#src/models/AudioPlayer";
import type { PcmClip } from "#src/models/PcmClip";
import type { SpeakerTensors } from "#src/models/SpeakerTensors";
import type { SpeechRequest } from "#src/models/SpeechRequest";

import { VoiceRequestType } from "#src/models/VoiceRequestType";
import { VoiceStatus } from "#src/models/VoiceStatus";
import {
  MAX_VOLUME,
  MESSAGE_DISPLAY_HOOK_TIMEOUT_MS,
  MODELS_DIRECTORY,
  RUNTIME_MANIFEST_PATH,
  VOICE_IDLE_TIMEOUT_MS,
  VOICE_STATUS_SEPARATOR,
} from "#src/services/constants";
import { createAudioPlayer } from "#src/services/createAudioPlayer";
import { createClipDecoder } from "#src/services/createClipDecoder";
import { createReplyQueue } from "#src/services/createReplyQueue";
import { createVoiceSynthesizer } from "#src/services/createVoiceSynthesizer";
import { getWavBytes } from "#src/services/getWavBytes";
import { listenVoiceSocket } from "#src/services/listenVoiceSocket";
import { parseVoiceRequest } from "#src/services/parseVoiceRequest";
import { readReferenceClip } from "#src/services/readReferenceClip";
import { readVoiceDevice } from "#src/services/readVoiceDevice";
import { readVoiceRuntime } from "#src/services/readVoiceRuntime";
import { writeVoiceDevice } from "#src/services/writeVoiceDevice";
import { writeVoiceLog } from "#src/services/writeVoiceLog";
import { createServer } from "node:net";

// The address is bound before the engine loads, so a second hook finds it taken rather than loading a second engine;
// Every failure is logged, since the hooks stay silent on its behalf
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
// Nothing between the bind and the connection handler below yields to the event loop: a hook connecting in such a gap
// Is accepted by nobody and waits for an answer that never comes, so every load is started here and awaited later
const idleTimer = setTimeout(() => {
  process.exit(0);
}, VOICE_IDLE_TIMEOUT_MS);
const runtime = readVoiceRuntime(RUNTIME_MANIFEST_PATH);
const decoderLoad = createClipDecoder();
// The rung is written once the engine has spoken on it, since a load alone proves nothing about the sound
let settledDevice = readVoiceDevice();
const synthesizerLoad = createVoiceSynthesizer(runtime, MODELS_DIRECTORY, {
  onFallback: writeVoiceLog,
  rungName: settledDevice,
});
const getSpeakerKey = ({ language, name, stem }: SpeechRequest) => [language, name, stem].join("/");
const speakers = new Map<string, SpeakerTensors>();
// The reference is fetched, decoded and encoded once per character, dub and line per process
const readSpeaker = async (request: SpeechRequest) => {
  const [synthesizer, decoder] = await Promise.all([synthesizerLoad, decoderLoad]);
  const key = getSpeakerKey(request);
  const speaker = speakers.get(key);
  if (speaker) return speaker;

  const clip = await readReferenceClip(request.name, request.stem, request.language, decoder);
  if (!clip) return undefined;

  const encoded = await synthesizer.encodeReference(clip);
  speakers.set(key, encoded);
  return encoded;
};
// Each line is synthesized while the one before it plays; a warm has no player and speaks nothing, and a piece with
// No line in it is only its place in the reply
const speak = async (request: SpeechRequest, player: AudioPlayer | undefined, checkIsSuperseded: () => boolean) => {
  if (request.lines.length === 0) return VoiceStatus.Ok;

  const synthesizer = await synthesizerLoad;
  const speaker = await readSpeaker(request);
  if (!speaker) {
    writeVoiceLog(`no reference for ${request.name} in ${request.language}`);
    return VoiceStatus.Error;
  }

  const gain = request.volume / MAX_VOLUME;
  const play = async ({ play: playAudio }: AudioPlayer, clip: PcmClip) => {
    const audio = getWavBytes({ ...clip, samples: clip.samples.map((sample) => sample * gain) });
    const playerFailure = await playAudio(audio);
    if (playerFailure) writeVoiceLog(`the player did not play: ${playerFailure}`);
  };
  let playback: Promise<void> = Promise.resolve();
  for (const line of request.lines) {
    const clip = await synthesizer.synthesize(line, speaker);
    if (!clip) {
      await playback;
      return VoiceStatus.Error;
    }

    if (synthesizer.device !== settledDevice) {
      settledDevice = synthesizer.device;
      writeVoiceDevice(settledDevice);
    }

    if (!player) continue;

    await playback;
    if (checkIsSuperseded()) return VoiceStatus.Superseded;

    playback = play(player, clip);
  }

  await playback;
  return VoiceStatus.Ok;
};
// The player is spawned before the first line is synthesized, so its start is paid under that synthesis rather than
// In front of the first sound. A request that throws is dropped and keeps the engine
const queue = createReplyQueue(async (request: SpeechRequest, checkIsSuperseded: () => boolean) => {
  const isSpoken = request.type === VoiceRequestType.Speak && request.lines.length > 0;
  const player = isSpoken ? createAudioPlayer() : undefined;
  const [outcome] = await Promise.allSettled([speak(request, player, checkIsSuperseded)]);
  await player?.close();
  if (outcome?.status === "fulfilled") return outcome.value;

  writeVoiceLog(`${request.type} failed: ${String(outcome?.reason)}`);
  return VoiceStatus.Error;
}, MESSAGE_DISPLAY_HOOK_TIMEOUT_MS);
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
    // A line that is not JSON throws out of the parser synchronously; `Promise.try` turns that into a rejection this
    // Answers rather than one nothing on the socket hears
    const [outcome] = await Promise.allSettled([Promise.try(() => handleLine(line))]);
    const status = outcome?.status === "fulfilled" ? outcome.value : VoiceStatus.Error;
    if (outcome?.status === "rejected") writeVoiceLog(`request failed: ${outcome.reason}`);
    const [load] = await Promise.allSettled([synthesizerLoad]);
    const device = load?.status === "fulfilled" ? load.value.device : "";
    socket.end(`${[status, device].filter(Boolean).join(VOICE_STATUS_SEPARATOR)}\n`);
  };
  // `socket.on` is a third-party slot that takes no promise, and the codebase's synchronized-function helper lives in
  // The web app a shipped plugin cannot import from
  socket.on("data", (chunk: string) => {
    // oxlint-disable-next-line typescript/no-floating-promises -- `answer` settles every outcome and ends the socket on each
    answer(chunk);
  });
  // A hook, which hands its piece over and leaves before the answer
  socket.on("error", () => {});
});
// Either load failing leaves the socket bound over an engine that answers nothing, since a reading awaits both, so
// Both outcomes are read rather than the synthesizer's alone
for (const load of await Promise.allSettled([synthesizerLoad, decoderLoad]))
  if (load.status === "rejected") exit(`load failed: ${String(load.reason)}`);
