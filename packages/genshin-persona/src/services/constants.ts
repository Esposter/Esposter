import type { TravelerTwin } from "#src/models/TravelerTwin";
import type { VoiceDeviceRung } from "#src/models/VoiceDeviceRung";

import { TravelerGender } from "#src/models/TravelerGender";
import { VoiceLanguage } from "#src/models/VoiceLanguage";
import { homedir } from "node:os";
import { join } from "node:path";

export const STATE_DIRECTORY: string = join(homedir(), ".claude", "genshin-persona");
export const PICK_RECORDS_PATH: string = join(STATE_DIRECTORY, "picks.tsv");
export const PIN_PATH: string = join(STATE_DIRECTORY, "pin");
export const MUTED_PATH: string = join(STATE_DIRECTORY, "muted");
export const VOLUME_PATH: string = join(STATE_DIRECTORY, "volume");
// The voice half of the state directory, written by the `voice` verb and removed by `teardown`: the dub's code, the
// Rung of the device ladder the synthesizer settled on, the engine's runtime npm-installed from the manifest the
// Plugin carries, the weights in the runtime's own cache layout, one reference clip per character fetched so far
// Under its dub, and why the synthesizer last refused
export const LANGUAGE_PATH: string = join(STATE_DIRECTORY, "language");
export const VOICE_DEVICE_PATH: string = join(STATE_DIRECTORY, "device");
export const RUNTIME_DIRECTORY: string = join(STATE_DIRECTORY, "runtime");
export const RUNTIME_MANIFEST_PATH: string = join(RUNTIME_DIRECTORY, "package.json");
export const RUNTIME_LOCKFILE_PATH: string = join(RUNTIME_DIRECTORY, "package-lock.json");
export const RUNTIME_MODULES_DIRECTORY: string = join(RUNTIME_DIRECTORY, "node_modules");
export const MODELS_DIRECTORY: string = join(STATE_DIRECTORY, "models");
export const REFERENCES_DIRECTORY: string = join(STATE_DIRECTORY, "references");
export const VOICE_LOG_PATH: string = join(STATE_DIRECTORY, "voice.log");
// What `teardown` removes: everything the `voice` verb wrote, and not the pick records or the pin, which are the
// Persona's rather than the voice's
export const VOICE_STATE_PATHS: string[] = [
  LANGUAGE_PATH,
  VOICE_DEVICE_PATH,
  RUNTIME_DIRECTORY,
  MODELS_DIRECTORY,
  REFERENCES_DIRECTORY,
  VOICE_LOG_PATH,
];
// The manifest and lockfile the verb copies into the runtime directory before `npm ci`; the plugin's own manifest
// Never names the package, since the install copies the plugin whole and runs a frozen install under a ceiling
export const RUNTIME_SOURCE_DIRECTORY: string = join(import.meta.dirname, "..", "..", "runtime");
export const STATUS_LAUNCHER_PATH: string = join(STATE_DIRECTORY, "status.mjs");
export const STATUS_SCRIPT_PATH: string = join(import.meta.dirname, "..", "..", "scripts", "status.ts");
export const VOICE_SERVER_SCRIPT_PATH: string = join(import.meta.dirname, "..", "..", "scripts", "voice.ts");
export const WARM_SCRIPT_PATH: string = join(import.meta.dirname, "..", "..", "scripts", "warm.ts");
export const SPINNER_SCRIPT_PATH: string = join(import.meta.dirname, "..", "..", "scripts", "spinner.ts");
// One local address per machine that node's `net` serves from either spelling: a named pipe on Windows, a socket
// File in the state directory elsewhere, and no port to collide on
export const VOICE_SOCKET_PATH: string =
  process.platform === "win32" ? String.raw`\\.\pipe\genshin-persona-voice` : join(STATE_DIRECTORY, "voice.sock");
export const USER_SETTINGS_PATH: string = join(homedir(), ".claude", "settings.json");
// What marks a status line command and a tip id as this plugin's, whichever character wrote them; it is what a
// Spinner in the user settings is ours by, the way the launcher's path marks the status line as ours
export const PLUGIN_MARKER = "genshin-persona";
// Between the marker and a tip id's own prefix
export const TIP_ID_MARKER_SEPARATOR = ".";
// The prefix of the base tips' ids; a character's own tips take the card's name
export const BASE_TIP_ID = "teyvat";
// Between a tip id's prefix and its index
export const TIP_ID_SEPARATOR = "-";
// The tool reads this many tips off the override and no more, so a character's list is cut there, and drops a
// Tip longer than this, so a line is cut to the sentences that fit
export const MAX_SPINNER_TIP_COUNT = 200;
export const MAX_SPINNER_TIP_LENGTH = 500;
export const PERSONA_CARDS_DIRECTORY: string = join(import.meta.dirname, "..", "personaCards");
// A card is a typed module, one per character, named for the character
export const PERSONA_MODULE_EXTENSION = ".ts";
// Between a card's habits where the lore pick reads them as one description of the character
export const HABIT_SEPARATOR = " ";
export const CARD_DETAIL_SEPARATOR = " · ";
// What the model reads the headline under, and what the person reads it under
export const CONTEXT_HEADLINE_PREFIX = "Persona: ";
export const NAMEPLATE_PREFIX = "✦ ";
export const ANSI_RESET = "\u001B[0m";
// The status line's colour per element, as the game's interface paints the element's name; an element missing here
// (the player character's "None") leaves the nameplate in the terminal's own colour
export const ElementColorMap: Record<string, string> = {
  Anemo: "#33ccb3",
  Cryo: "#98c8e8",
  Dendro: "#7bb42d",
  Electro: "#d376f0",
  Geo: "#cfa726",
  Hydro: "#1c72fd",
  Pyro: "#e2311d",
};
// Between the fields of a pick record and of the pin
export const STATE_FIELD_SEPARATOR = "\t";
export const PICK_RETENTION_DAYS = 7;
// The roster cache's file name is the prefix and the installed data package's version, so a bump writes a new one
export const ROSTER_CACHE_PREFIX = "roster-";
export const ROSTER_CACHE_EXTENSION = ".json";
// Every month and day is measured inside one leap year, so 29 February is a day like any other and the year wraps
export const LEAP_YEAR = 2000;
export const DATE_LOCALE = "en-AU";
// The community wiki: the source of a character's lines before the game-data package carries them, and of the
// Clip a character's voice is cloned from
export const WIKI_ORIGIN = "https://genshin-impact.fandom.com";
// oxlint-disable-next-line typescript/no-inferrable-types -- `isolatedDeclarations` demands the annotation this template would otherwise infer
export const WIKI_VOICE_OVERS_URL: string = `${WIKI_ORIGIN}/api.php?action=parse&prop=wikitext&format=json&page=`;
// The imageinfo query, which answers a file title with the file's URL in one call
// oxlint-disable-next-line typescript/no-inferrable-types -- `isolatedDeclarations` demands the annotation this template would otherwise infer
export const WIKI_IMAGE_INFO_URL: string = `${WIKI_ORIGIN}/api.php?action=query&prop=imageinfo&iiprop=url&format=json&titles=`;
export const WIKI_USER_AGENT = "esposter-genshin-persona (card authoring)";
// The player twins have no page of their own: the Traveler's index links one story page per region, and every
// Line on those is a dialogue with Paimon filed under a file per twin, with a gendered word choice in the text
export const TravelerTwinMap: Record<string, TravelerTwin> = {
  Aether: { gender: TravelerGender.Male, namePlaceholder: "{character1}" },
  Lumine: { gender: TravelerGender.Female, namePlaceholder: "{character2}" },
};
// One attempt with a short ceiling on every wiki call: a host that takes the connection and never finishes the
// Response would otherwise hold the command — or the hook a reply waits behind — open for as long as it cared to
export const WIKI_FETCH_TIMEOUT_MS = 10_000;
// The wiki's file host serves a file only to a request that says it came from the wiki — hotlink protection, which
// The API is exempt from — so a clip is fetched naming the page it was found on, under the plugin's own user agent;
// Its edge also challenges the fetch client's handshake, so a clip is read through `readWikiFile` and never `fetch`
export const WIKI_FILE_REQUEST_HEADERS: Record<string, string> = {
  referer: `${WIKI_ORIGIN}/`,
  "user-agent": WIKI_USER_AGENT,
};
// A voice line's file on the wiki is `VO_`, the dub's prefix, the character's name and the line's title, and the
// English dub carries no prefix
export const WIKI_VOICE_FILE_PREFIX = "VO_";
export const WIKI_VOICE_FILE_EXTENSION = ".ogg";
export const LanguageDubPrefixMap: Record<VoiceLanguage, string> = {
  [VoiceLanguage.Chinese]: "ZH_",
  [VoiceLanguage.English]: "",
  [VoiceLanguage.Japanese]: "JA_",
  [VoiceLanguage.Korean]: "KO_",
};
// The volume is a whole number of this scale, applied as a gain on the samples; the top of the scale is the
// Engine's own level
export const MAX_VOLUME = 100;
// The engine: Chatterbox Turbo through the ONNX runtime, with a dtype per component, each measured against the
// Character's own voice before it was chosen: the speech encoder's half-precision weights cost no likeness; the
// Language model is the 4-bit variant, which cost none either and speaks twice as fast; the vocoder stays full
// Precision, because its half-precision variant is the one that moved the likeness, by a tenth to a fifth — on the
// GPU rung, which it alone passes the sound check on. The language model's session is keyed `model` and its file
// `language_model`, so both spellings carry its dtype
export const VOICE_MODEL_ID = "ResembleAI/chatterbox-turbo-ONNX";
export const VOICE_MODEL_ARCHITECTURE = "ChatterboxModel";
export const VOICE_MODEL_DTYPE: Record<string, string> = {
  conditional_decoder: "fp32",
  embed_tokens: "fp16",
  language_model: "q4f16",
  model: "q4f16",
  speech_encoder: "fp16",
};
export const VOICE_CPU_DEVICE = "cpu";
export const VOICE_GPU_DEVICE = "webgpu";
// The language model's three sessions share a device, the vocoder has its own, and the speech encoder runs once
// Per character on the CPU, where the WebGPU provider rejects its graph
const getVoiceDeviceMap = (languageModelDevice: string, vocoderDevice: string): Record<string, string> => ({
  conditional_decoder: vocoderDevice,
  embed_tokens: languageModelDevice,
  language_model: languageModelDevice,
  model: languageModelDevice,
  speech_encoder: VOICE_CPU_DEVICE,
});
// Where the engine runs, fastest first, and verified by the sound rather than by the load: a provider that loads
// A graph can still run it wrong — this machine's WebGPU provider returns a constant near-silence from the full
// Precision vocoder on most runs and throws nothing — so a synthesis that is not speech moves the engine down one
// Rung and runs again, a load that rejects moves it the same way, and the last rung failing is an error the log
// Sees. The rung that spoke is kept in the state directory, so the next synthesizer starts there rather than
// Walking the rungs above it again, and the `voice` verb clears it so its proof walks the ladder from the top. A
// Rung is named for what runs on the GPU, since the CPU vocoder still speaks ahead of real time
export const VOICE_DEVICE_LADDER: [VoiceDeviceRung, ...VoiceDeviceRung[]] = [
  { devices: getVoiceDeviceMap(VOICE_GPU_DEVICE, VOICE_GPU_DEVICE), name: VOICE_GPU_DEVICE },
  { devices: getVoiceDeviceMap(VOICE_GPU_DEVICE, VOICE_CPU_DEVICE), name: `${VOICE_GPU_DEVICE}-language-model` },
  { devices: getVoiceDeviceMap(VOICE_CPU_DEVICE, VOICE_CPU_DEVICE), name: VOICE_CPU_DEVICE },
];
// What a synthesis has to be to count as spoken: a loudest frame at least this loud, since the engine masters
// Its output near full scale and a vocoder run wrong lands tens of decibels under it, and a quietest frame the
// Speech floor below the loudest, since a sentence has pauses where noise has none
export const MIN_SPEECH_PEAK_DB = -40;
// The rate the engine reads a reference at and writes a waveform at
export const VOICE_SAMPLE_RATE = 24_000;
// The engine conditions on this much of a reference, so a longer clip is trimmed rather than encoded whole
export const MAX_REFERENCE_SECONDS = 10;
// A clip's energy is read per frame, this long and this far apart, and a frame this far below the loudest is not
// Speech: what a clip's speech seconds are counted over, and where a turn of a dialogue ends
export const FRAME_SECONDS = 0.04;
export const HOP_SECONDS = 0.01;
export const SPEECH_FLOOR_DB = 35;
// A twin's line is theirs only until Paimon answers, so their reference is cut at the first silence this long
export const MIN_TURN_PAUSE_SECONDS = 0.4;
// A sentence ends at the model's end-of-sequence token and nowhere else; the runtime stops at twenty tokens when
// This option is left out, so it is passed as no bound rather than dropped
// oxlint-disable-next-line typescript/no-inferrable-types -- `isolatedDeclarations` demands the annotation this identifier would otherwise infer
export const UNBOUNDED_SPEECH_TOKENS: number = Infinity;
// What a warm request synthesizes and drops, so the graph's first-call cost is paid before the first reply
export const WARM_TEXT = "Ready.";
// What the `voice` verb speaks once set up, so the person hears the voice before the first reply does
export const VOICE_PROOF_TEXT = "The voice is set up, and every reply is read from here on.";
// The synthesizer exits when no request has arrived for this long, freeing the GPU memory the model holds
export const VOICE_IDLE_TIMEOUT_MS: number = Temporal.Duration.from({ minutes: 30 }).total("milliseconds");
// How long a hook keeps trying to reach a synthesizer it spawned: a cold load from the weights on disk, with room
export const VOICE_LOAD_BUDGET_MS: number = Temporal.Duration.from({ minutes: 1 }).total("milliseconds");
export const VOICE_RETRY_INTERVAL_MS = 500;
// Between the status a synthesizer answers with and the device that loaded
export const VOICE_STATUS_SEPARATOR = " ";
// The tool sets it in every Bash tool and hook subprocess to the same id the hook input carries, so a command run
// From inside a session knows which session it is in
export const SESSION_ID_ENVIRONMENT_VARIABLE = "CLAUDE_CODE_SESSION_ID";
export const TYPESAFE_KEY_ENVIRONMENT_VARIABLE = "CLAUDE_PLUGIN_OPTION_TYPESAFE_KEY";
export const TYPESAFE_KEY_FALLBACK_ENVIRONMENT_VARIABLE = "TYPESAFE_API_KEY";
// One attempt and a short ceiling: the lore pick sits in the session-start path, and a start that cannot reach
// The tier has the birthday pick to fall back on
export const LORE_PICK_TIMEOUT_MS = 8000;
export const LORE_PICK_INSTRUCTIONS =
  "Which character should keep the person company in today's session? Each option is described by how that character talks and carries themselves. Weigh what the date means in the game: a birthday today or within a few days, a festival or event of a region in this season, a release or story anniversary, the patch that is live. Weigh the person's moment too: the weekday, the hour and the place. Every character is a fair pick; the choice is a preference, not a rule.";
