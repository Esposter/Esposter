import type { ReplyPiece } from "#src/models/ReplyPiece";
import type { TravelerTwin } from "#src/models/TravelerTwin";
import type { VoiceDeviceRung } from "#src/models/VoiceDeviceRung";
import type { WikiVoiceOversPage } from "#src/models/WikiVoiceOversPage";

import { TravelerGender } from "#src/models/TravelerGender";
import { VoiceLanguage } from "#src/models/VoiceLanguage";
import { homedir } from "node:os";
import { join } from "node:path";

export const STATE_DIRECTORY: string = join(homedir(), ".claude", "genshin-persona");
export const PICK_RECORDS_PATH: string = join(STATE_DIRECTORY, "picks.tsv");
export const PIN_PATH: string = join(STATE_DIRECTORY, "pin");
export const MUTED_PATH: string = join(STATE_DIRECTORY, "muted");
// The persona's rather than the voice's, so `teardown` leaves them: the language every word the plugin writes is in,
// And the language the model answers in, which follows the first until it is set on its own
export const INTERFACE_LANGUAGE_PATH: string = join(STATE_DIRECTORY, "interface-language");
export const REPLY_LANGUAGE_PATH: string = join(STATE_DIRECTORY, "reply-language");
export const VOLUME_PATH: string = join(STATE_DIRECTORY, "volume");
// The voice half of the state directory: written by the `voice` verb, removed by `teardown`
export const VOICE_LANGUAGE_PATH: string = join(STATE_DIRECTORY, "voice-language");
export const VOICE_DEVICE_PATH: string = join(STATE_DIRECTORY, "device");
export const RUNTIME_DIRECTORY: string = join(STATE_DIRECTORY, "runtime");
export const RUNTIME_MANIFEST_PATH: string = join(RUNTIME_DIRECTORY, "package.json");
export const RUNTIME_LOCKFILE_PATH: string = join(RUNTIME_DIRECTORY, "package-lock.json");
export const RUNTIME_MODULES_DIRECTORY: string = join(RUNTIME_DIRECTORY, "node_modules");
export const MODELS_DIRECTORY: string = join(STATE_DIRECTORY, "models");
export const REFERENCES_DIRECTORY: string = join(STATE_DIRECTORY, "references");
export const VOICE_LOG_PATH: string = join(STATE_DIRECTORY, "voice.log");
// Everything the `voice` verb wrote, and not the pick records or the pin, which are the persona's
export const VOICE_STATE_PATHS: string[] = [
  VOICE_LANGUAGE_PATH,
  VOICE_DEVICE_PATH,
  RUNTIME_DIRECTORY,
  MODELS_DIRECTORY,
  REFERENCES_DIRECTORY,
  VOICE_LOG_PATH,
];
export const SOURCE_DIRECTORY: string = join(import.meta.dirname, "..");
const PLUGIN_DIRECTORY = join(SOURCE_DIRECTORY, "..");
const SCRIPTS_DIRECTORY = join(PLUGIN_DIRECTORY, "scripts");
// Copied into the runtime directory before `npm ci`; the plugin's own manifest never names the package, since the
// Install copies the plugin whole and runs a frozen install under a ceiling
export const RUNTIME_SOURCE_DIRECTORY: string = join(PLUGIN_DIRECTORY, "runtime");
// The two user settings that name a script point at a launcher in the state directory, re-aimed at the running
// Install on every session start, since an install lands under a directory named after its version
export const STATUS_LAUNCHER_PATH: string = join(STATE_DIRECTORY, "status.mjs");
export const STATUS_SCRIPT_PATH: string = join(SCRIPTS_DIRECTORY, "status.ts");
export const SPEAK_LAUNCHER_PATH: string = join(STATE_DIRECTORY, "speak.mjs");
export const SPEAK_SCRIPT_PATH: string = join(SCRIPTS_DIRECTORY, "speak.ts");
export const VOICE_SERVER_SCRIPT_PATH: string = join(SCRIPTS_DIRECTORY, "voice.ts");
export const SPINNER_SCRIPT_PATH: string = join(SCRIPTS_DIRECTORY, "spinner.ts");
// A named pipe on Windows, a socket file elsewhere: one address per machine and no port to collide on
export const VOICE_SOCKET_PATH: string =
  process.platform === "win32" ? String.raw`\\.\pipe\genshin-persona-voice` : join(STATE_DIRECTORY, "voice.sock");
export const USER_SETTINGS_PATH: string = join(homedir(), ".claude", "settings.json");
// What marks a status line command and a tip id as this plugin's, whichever character wrote them
export const PLUGIN_MARKER = "genshin-persona";
// The WAV a sentence is played from carries the process, so two synthesizers on one machine never share a name.
// oxlint-disable-next-line typescript/no-inferrable-types -- `isolatedDeclarations` demands the annotation this template literal would otherwise infer
export const PLAYER_FILE_PREFIX: string = `${PLUGIN_MARKER}-${process.pid}-`;
// Between the marker and a tip id's own prefix
export const TIP_ID_MARKER_SEPARATOR = ".";
// Between a tip id's prefix and its index
export const TIP_ID_SEPARATOR = "-";
// The tool reads this many tips off the override and no more, and drops a tip longer than this
export const MAX_SPINNER_TIP_COUNT = 200;
export const MAX_SPINNER_TIP_LENGTH = 500;
export const PERSONA_CARDS_DIRECTORY: string = join(SOURCE_DIRECTORY, "personaCards");
// One typed module per language for the words the data package does not carry
export const LOCALIZATIONS_DIRECTORY: string = join(SOURCE_DIRECTORY, "localizations");
// A card is a typed module, one per character, named for the character
export const MODULE_EXTENSION = ".ts";
// Between a card's habits where the lore pick reads them as one description of the character
export const HABIT_SEPARATOR = " ";
export const CARD_DETAIL_SEPARATOR = " · ";
// What the model reads the headline under, and what the person reads it under
export const CONTEXT_HEADLINE_PREFIX = "Persona: ";
export const NAMEPLATE_PREFIX = "✦ ";
// The line naming the character for a program rather than a person: the agent console's Genshin theme finds it in the
// Session-start hook's context, spelled the same on both sides, so neither parses the headline's prose
export const CHARACTER_LINE_PREFIX = "Character: ";
// In the session's context beside the card rather than in the output style, which is one shipped file the same for
// Everybody; absent at English
export const REPLY_LANGUAGE_INSTRUCTION = (language: string): string =>
  `Write every reply in ${language}, the character's spoken lines included. This applies to prose only, and to nothing the output style already excludes from the character's voice: code, comments, commit messages, file contents, commands and error text stay as they are.`;
export const ANSI_RESET = "\u001B[0m";
// A "#rrggbb" triplet's channels: two hex digits each, 0 to 255
export const HEX_RADIX = 16;
export const HEX_CHANNEL_LENGTH = 2;
export const MAX_COLOR_CHANNEL_VALUE = 255;
// The surface a nameplate's badge is a tonal fill over, and how much of the character's colour that fill mixes in: the
// Design language's tonal button, over dusk's background, the agent console's, since a terminal is mostly dark
export const NAMEPLATE_SURFACE = "#16161e";
export const NAMEPLATE_TONAL_MIX_PERCENTAGE = 12;
// The status line's colour per element, as the game's interface paints the element's name: what a character with no
// Row in `CharacterColorMap` yet is drawn in, and an element missing here too (the player character's "None")
// Leaves the nameplate in the terminal's own colour
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
// The welcome names the other birthdays this many days ahead, today's included
export const UPCOMING_BIRTHDAYS_DAYS = 7;
// A birthday as the welcome spells it, in the interface language's own month name
export const BIRTHDAY_DATE_FORMAT: Intl.DateTimeFormatOptions = { day: "numeric", month: "long" };
// The lore pick's request is an English instruction whatever the interface language is
export const LORE_MOMENT_LOCALE = "en-AU";
// What the data package answers in unasked, and what our own words are written in
export const DEFAULT_LANGUAGE = "English";
// The BCP-47 tag per language the data package names, which it does not carry and `Intl.DisplayNames` needs; a
// Language missing here is named by the package's own English word for it, which is also what a person types
export const LanguageLocaleMap: Record<string, string> = {
  ChineseSimplified: "zh-Hans",
  ChineseTraditional: "zh-Hant",
  English: "en",
  French: "fr",
  German: "de",
  Indonesian: "id",
  Italian: "it",
  Japanese: "ja",
  Korean: "ko",
  Portuguese: "pt",
  Russian: "ru",
  Spanish: "es",
  Thai: "th",
  Turkish: "tr",
  Vietnamese: "vi",
};
// The source of a character's lines before the game-data package carries them, and of the clip a voice is cloned from
const WIKI_ORIGIN = "https://genshin-impact.fandom.com";
// oxlint-disable-next-line typescript/no-inferrable-types -- `isolatedDeclarations` demands the annotation this template would otherwise infer
export const WIKI_VOICE_OVERS_URL: string = `${WIKI_ORIGIN}/api.php?action=parse&prop=wikitext&format=json&page=`;
// The imageinfo query, which answers a file title with the file's URL in one call
// oxlint-disable-next-line typescript/no-inferrable-types -- `isolatedDeclarations` demands the annotation this template would otherwise infer
export const WIKI_IMAGE_INFO_URL: string = `${WIKI_ORIGIN}/api.php?action=query&prop=imageinfo&iiprop=url&format=json&titles=`;
export const WIKI_USER_AGENT = "esposter-genshin-persona (card authoring)";
// The character's own voice-over page, which every other language's is a subpage of
export const WIKI_ENGLISH_VOICE_OVERS_PAGE: WikiVoiceOversPage = { fieldSuffix: "", subpage: "" };
// The wiki transcribes the four dubs' lines, each on its own subpage of the character's English page; the Chinese
// Page holds both scripts, keyed by a suffix on every title and text field. The other languages have no page, so a
// Character the data package has no lines for yet in one of them shows their description
export const WikiVoiceOversPageMap: Record<string, WikiVoiceOversPage> = {
  ChineseSimplified: { fieldSuffix: "_s", subpage: "/Chinese" },
  ChineseTraditional: { fieldSuffix: "_t", subpage: "/Chinese" },
  [DEFAULT_LANGUAGE]: WIKI_ENGLISH_VOICE_OVERS_PAGE,
  Japanese: { fieldSuffix: "", subpage: "/Japanese" },
  Korean: { fieldSuffix: "", subpage: "/Korean" },
};
// The twins have no page of their own: every line is a dialogue with Paimon on the Traveler's story pages, filed
// Under a file per twin, with a gendered word choice in the text
export const TravelerTwinMap: Record<string, TravelerTwin> = {
  Aether: { gender: TravelerGender.Male, namePlaceholder: "{character1}" },
  Lumine: { gender: TravelerGender.Female, namePlaceholder: "{character2}" },
};
// A host that takes the connection and never finishes would otherwise hold the hook a reply waits behind open
export const WIKI_FETCH_TIMEOUT_MS: number = Temporal.Duration.from({ seconds: 10 }).total("milliseconds");
// The file host serves a clip only to a request naming the wiki as its referer, and its edge answers `fetch` with a
// Browser challenge under the same headers, so a clip is read through `readWikiFile`
export const WIKI_FILE_REQUEST_HEADERS: Record<string, string> = {
  referer: `${WIKI_ORIGIN}/`,
  "user-agent": WIKI_USER_AGENT,
};
// A line's file is `VO_`, the dub's prefix, the character's name and the line's title; the English dub has no prefix
export const WIKI_VOICE_FILE_PREFIX = "VO_";
export const WIKI_VOICE_FILE_EXTENSION = ".ogg";
// The one thing the interface language says about the voice: whether a dub of it exists at all. Four of the fifteen
export const VoiceLanguageNameMap: Record<VoiceLanguage, string> = {
  [VoiceLanguage.Chinese]: "ChineseSimplified",
  [VoiceLanguage.English]: DEFAULT_LANGUAGE,
  [VoiceLanguage.Japanese]: "Japanese",
  [VoiceLanguage.Korean]: "Korean",
};
export const LanguageDubPrefixMap: Record<VoiceLanguage, string> = {
  [VoiceLanguage.Chinese]: "ZH_",
  [VoiceLanguage.English]: "",
  [VoiceLanguage.Japanese]: "JA_",
  [VoiceLanguage.Korean]: "KO_",
};
// A whole number of this scale, applied as a gain; the top is the engine's own level
export const MAX_VOLUME = 100;
// The Nano export ships one variant per component, so the dtype map names what exists rather than what was chosen:
// Half-precision embeddings, and 4-bit weights for the rest — over full-precision activations in the vocoder and
// Half-precision ones in the language model and the speech encoder. The language model's session is keyed `model`
// And its file `language_model`, so both spellings carry its dtype
export const VOICE_MODEL_ID = "owensong/chatterbox-nano-ONNX";
export const VOICE_MODEL_ARCHITECTURE = "ChatterboxModel";
export const VOICE_MODEL_DTYPE: Record<string, string> = {
  conditional_decoder: "q4",
  embed_tokens: "fp16",
  language_model: "q4f16",
  model: "q4f16",
  speech_encoder: "q4f16",
};
export const VOICE_CPU_DEVICE = "cpu";
export const VOICE_GPU_DEVICE = "webgpu";
// The speech encoder runs on the CPU on every rung, since the WebGPU provider rejects its graph
const getVoiceDeviceMap = (languageModelDevice: string, vocoderDevice: string): Record<string, string> => ({
  conditional_decoder: vocoderDevice,
  embed_tokens: languageModelDevice,
  language_model: languageModelDevice,
  model: languageModelDevice,
  speech_encoder: VOICE_CPU_DEVICE,
});
// Fastest first, and verified by the sound rather than the load: this machine's WebGPU provider returns a constant
// Near-silence from the full-precision vocoder and throws nothing. A rung is named for what runs on the GPU
export const VOICE_DEVICE_LADDER: [VoiceDeviceRung, ...VoiceDeviceRung[]] = [
  { devices: getVoiceDeviceMap(VOICE_GPU_DEVICE, VOICE_GPU_DEVICE), name: VOICE_GPU_DEVICE },
  { devices: getVoiceDeviceMap(VOICE_GPU_DEVICE, VOICE_CPU_DEVICE), name: `${VOICE_GPU_DEVICE}-language-model` },
  { devices: getVoiceDeviceMap(VOICE_CPU_DEVICE, VOICE_CPU_DEVICE), name: VOICE_CPU_DEVICE },
];
// The runtime names the provider that raised a failure by its source path, in either separator. A failure the GPU
// Provider raises — a device lost under load — is the rung's, and the line reads on the rung below; the CPU provider
// Is deterministic, so a failure it raises is the line's and would recur on every rung
// oxlint-disable-next-line typescript/no-inferrable-types -- `isolatedDeclarations` demands the annotation this regex would otherwise infer
export const GPU_PROVIDER_FAILURE_REGEX: RegExp = new RegExp(String.raw`providers[\\/]${VOICE_GPU_DEVICE}`, "u");
// A loudest frame at least this loud, since a vocoder run wrong lands tens of decibels under the engine's level, and
// A quietest frame the speech floor below it, since a sentence has pauses where noise has none
export const MIN_SPEECH_PEAK_DB = -40;
// The rate the engine reads a reference at and writes a waveform at
export const VOICE_SAMPLE_RATE = 24_000;
// The engine conditions on this much of a reference, trimmed from a clip's opening: the vocoder runs over the
// Reference's tokens on every unit, so the trim is what the vendor calls enough — about five seconds — and a likeness
// Measured no lower than at ten, where three seconds leave the model no ending to find
export const MAX_REFERENCE_SECONDS = 5;
// A clip's energy per frame, this long and this far apart; a frame this far below the loudest is not speech
export const FRAME_SECONDS = 0.04;
export const HOP_SECONDS = 0.01;
export const SPEECH_FLOOR_DB = 35;
// A twin's line is theirs only until Paimon answers, so their reference is cut at the first silence this long
export const MIN_TURN_PAUSE_SECONDS = 0.4;
// A ceiling on the speech tokens one sentence may generate, in proportion to its text with a floor for the shortest:
// A few tokens a character is above what English reads at, a fixed ceiling cuts long sentences mid-word, and no ceiling
// Lets a sentence the model finds no end for run for minutes and then hand the vocoder a sequence it rejects
export const MAX_SPEECH_TOKENS_PER_CHARACTER = 4;
export const MIN_SPEECH_TOKEN_CEILING = 100;
// What a warm request synthesizes, so the graph's first-call cost is paid before the first reply
export const WARM_TEXT = "Ready.";
// What the `voice` verb speaks once set up, so the person hears the voice before the first reply does
export const VOICE_PROOF_TEXT = "The voice is set up, and a reply's spoken lines are read from the next session on.";
// The synthesizer exits when no request has arrived for this long, freeing the GPU memory the model holds
export const VOICE_IDLE_TIMEOUT_MS: number = Temporal.Duration.from({ minutes: 30 }).total("milliseconds");
// The tool's own default timeout on a MessageDisplay hook, which bounds two waits: how long a hook keeps trying to
// Reach a synthesizer it spawned — a node start to the bind, never the load — and how long the synthesizer holds a
// Piece of a reply for one before it that has not arrived, past which the hook carrying it was killed
export const MESSAGE_DISPLAY_HOOK_TIMEOUT_MS: number = Temporal.Duration.from({ seconds: 10 }).total("milliseconds");
export const VOICE_RETRY_INTERVAL_MS = 100;
// Where a request with no turn sits: one piece of no message, the whole of it
export const TURNLESS_PIECE: ReplyPiece = { index: 0, isFinal: true, messageId: "", turnId: "" };
// Between the status a synthesizer answers with and the device that loaded
export const VOICE_STATUS_SEPARATOR = " ";
// Set by the tool in every Bash and hook subprocess to the same id the hook input carries
export const SESSION_ID_ENVIRONMENT_VARIABLE = "CLAUDE_CODE_SESSION_ID";
export const TYPESAFE_KEY_ENVIRONMENT_VARIABLE = "CLAUDE_PLUGIN_OPTION_TYPESAFE_KEY";
export const TYPESAFE_KEY_FALLBACK_ENVIRONMENT_VARIABLE = "TYPESAFE_API_KEY";
// One attempt and a short ceiling: the lore pick sits in the session-start path and has the birthday pick behind it
export const LORE_PICK_TIMEOUT_MS: number = Temporal.Duration.from({ seconds: 8 }).total("milliseconds");
export const LORE_PICK_INSTRUCTIONS =
  "Which character should keep the person company in today's session? Each option is described by how that character talks and carries themselves. Weigh what the date means in the game: a birthday today or within a few days, a festival or event of a region in this season, a release or story anniversary, the patch that is live. Weigh the person's moment too: the weekday, the hour and the place. Every character is a fair pick; the choice is a preference, not a rule.";
// A reason in the tier's own English, beside the errors its SDK throws, for the one failure the code finds
export const LORE_PICK_UNKNOWN_NAME = (name: string): string => `answered ${name}, whom the roster does not hold`;
// The welcome's bar chart of the tier's answer: the choice and the nearest runners-up, one row each, the bar scaled to
// The longest of them
export const LORE_CHART_ROWS = 4;
export const LORE_CHART_WIDTH = 20;
export const LORE_CHART_GLYPH = "▇";
