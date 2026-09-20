import type { Character } from "#src/models/Character";

import { homedir } from "node:os";
import { join } from "node:path";

export const STATE_DIRECTORY: string = join(homedir(), ".claude", "genshin-persona");
export const PICK_RECORDS_PATH: string = join(STATE_DIRECTORY, "picks.tsv");
export const PIN_PATH: string = join(STATE_DIRECTORY, "pin");
export const MUTED_PATH: string = join(STATE_DIRECTORY, "muted");
export const VOLUME_PATH: string = join(STATE_DIRECTORY, "volume");
export const STATUS_LAUNCHER_PATH: string = join(STATE_DIRECTORY, "status.mjs");
export const STATUS_SCRIPT_PATH: string = join(import.meta.dirname, "..", "..", "scripts", "status.ts");
export const USER_SETTINGS_PATH: string = join(homedir(), ".claude", "settings.json");
export const STATUS_LINE_MARKER = "genshin-persona";
export const TIPS_PATH: string = join(STATE_DIRECTORY, "tips.json");
// The ids of the base tips, which every character shows; a character's own tips take the card slug
export const BASE_TIP_ID = "teyvat";
export const CARDS_DIRECTORY: string = join(import.meta.dirname, "..", "..", "cards");
export const CARD_EXTENSION = ".md";
export const SPINNER_CONTENT_PATH: string = join(import.meta.dirname, "..", "..", "spinner.md");
export const TIP_PREFIX = "- Tip: ";
export const VERBS_PREFIX = "- Verbs: ";
export const VERB_SEPARATOR = ", ";
export const CARD_DETAIL_SEPARATOR = " · ";
export const GREETING_PREFIX = "- Greets: ";
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
// Written out rather than totalled from a `Temporal.Duration`: the plugin runs under whatever node a stranger has,
// And `Temporal` is a global only on the newest majors
export const DAY_IN_MILLISECONDS = 86_400_000;
// Every month and day is measured inside one leap year, so 29 February is a day like any other and the year wraps
export const LEAP_YEAR = 2000;
export const DAYS_IN_LEAP_YEAR = 366;
export const DATE_LOCALE = "en-AU";
export const TRAVELER: Character = {
  birthday: "",
  description: "",
  element: "",
  name: "Traveler",
  region: "",
  title: "",
  version: "",
};
// The community wiki's parse API, the source of a character's lines before the game-data package carries them
export const WIKI_VOICE_OVERS_URL =
  "https://genshin-impact.fandom.com/api.php?action=parse&prop=wikitext&format=json&page=";
export const WIKI_USER_AGENT = "esposter-genshin-persona (card authoring)";
export const SPEECH_ENDPOINT_ENVIRONMENT_VARIABLE = "CLAUDE_PLUGIN_OPTION_SPEECH_ENDPOINT";
export const SPEECH_KEY_ENVIRONMENT_VARIABLE = "CLAUDE_PLUGIN_OPTION_SPEECH_KEY";
export const SPEECH_VOICE_ENVIRONMENT_VARIABLE = "CLAUDE_PLUGIN_OPTION_SPEECH_VOICE";
export const SPEECH_SYNTHESIS_PATH = "/cognitiveservices/v1";
export const DEFAULT_SPEECH_VOICE = "en-AU-NatashaNeural";
// A WAV the stock player of every desktop opens without a codec
export const SPEECH_OUTPUT_FORMAT = "riff-24khz-16bit-mono-pcm";
// The levels the speech markup's prosody names; a whole number of its 0 to 100 scale is the other spelling
export const SPEECH_VOLUME_LEVELS: string[] = ["default", "silent", "x-soft", "soft", "medium", "loud", "x-loud"];
export const MAX_SPEECH_VOLUME = 100;
export const TYPESAFE_KEY_ENVIRONMENT_VARIABLE = "CLAUDE_PLUGIN_OPTION_TYPESAFE_KEY";
export const TYPESAFE_KEY_FALLBACK_ENVIRONMENT_VARIABLE = "TYPESAFE_API_KEY";
// One attempt and a short ceiling: the lore pick sits in the session-start path, and a start that cannot reach
// The tier has the birthday pick to fall back on
export const LORE_PICK_TIMEOUT_MS = 8000;
export const LORE_PICK_INSTRUCTIONS =
  "Which character should keep the person company in today's session? Weigh what the date means in the game: a birthday today or within a few days, a festival or event of a region in this season, a release or story anniversary, the patch that is live. Weigh the person's moment too: the weekday, the hour and the place. Every character is a fair pick; the choice is a preference, not a rule.";
