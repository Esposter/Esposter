import type { Character } from "#src/models/Character";

import { homedir } from "node:os";
import { join } from "node:path";

export const STATE_DIRECTORY: string = join(homedir(), ".claude", "genshin-persona");
export const PICK_RECORDS_PATH: string = join(STATE_DIRECTORY, "picks.tsv");
export const PIN_PATH: string = join(STATE_DIRECTORY, "pin");
export const MUTED_PATH: string = join(STATE_DIRECTORY, "muted");
export const STATUS_LAUNCHER_PATH: string = join(STATE_DIRECTORY, "status.mjs");
export const STATUS_SCRIPT_PATH: string = join(import.meta.dirname, "..", "..", "scripts", "status.ts");
export const USER_SETTINGS_PATH: string = join(homedir(), ".claude", "settings.json");
export const STATUS_LINE_MARKER = "genshin-persona";
// Gerunds like the built-in verbs, appended to them: the spinner shows one of these while a turn runs
export const SPINNER_VERBS: string[] = [
  "Adventuring",
  "Ascending",
  "Climbing",
  "Commissioning",
  "Cooking",
  "Exploring",
  "Fishing",
  "Foraging",
  "Forging",
  "Gliding",
  "Sprinting",
  "Teleporting",
  "Wishing",
];
export const CARDS_DIRECTORY: string = join(import.meta.dirname, "..", "..", "cards");
export const CARD_EXTENSION = ".md";
export const CARD_DETAIL_SEPARATOR = " · ";
export const GREETING_PREFIX = "- Greets: ";
// What the model reads the headline under, and what the person reads it under
export const CONTEXT_HEADLINE_PREFIX = "Persona: ";
export const NAMEPLATE_PREFIX = "✦ ";
export const PICK_RECORD_SEPARATOR = "\t";
export const PICK_RETENTION_DAYS = 7;
// Written out rather than totalled from a `Temporal.Duration`: the plugin runs under whatever node a stranger has,
// And `Temporal` is a global only on the newest majors
export const DAY_IN_MILLISECONDS = 86_400_000;
// Every month and day is measured inside one leap year, so 29 February is a day like any other and the year wraps
export const LEAP_YEAR = 2000;
export const DAYS_IN_LEAP_YEAR = 366;
export const DATE_LOCALE = "en-AU";
export const TRAVELER: Character = { birthday: "", element: "", name: "Traveler", region: "", title: "", version: "" };
export const SPEECH_ENDPOINT_ENVIRONMENT_VARIABLE = "CLAUDE_PLUGIN_OPTION_SPEECH_ENDPOINT";
export const SPEECH_KEY_ENVIRONMENT_VARIABLE = "CLAUDE_PLUGIN_OPTION_SPEECH_KEY";
export const SPEECH_VOICE_ENVIRONMENT_VARIABLE = "CLAUDE_PLUGIN_OPTION_SPEECH_VOICE";
export const SPEECH_SYNTHESIS_PATH = "/cognitiveservices/v1";
export const DEFAULT_SPEECH_VOICE = "en-AU-NatashaNeural";
// A WAV the stock player of every desktop opens without a codec
export const SPEECH_OUTPUT_FORMAT = "riff-24khz-16bit-mono-pcm";
