import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { tmpdir } from "node:os";
import { join } from "node:path";

// The run's one output is a generated artifact and is committed as such (/docs/architecture/generated-artifacts):
// One map of numbers and file titles, read off audio that is never written anywhere — a clip is fetched, decoded,
// Measured and dropped, since the rule that no game audio enters the repository holds for a temporary folder
// Exactly as for a commit
export const PERSONA_REFERENCE_MAP_PATH: string = join(
  REPOSITORY_ROOT,
  "packages",
  "genshin-persona",
  "src",
  "generated",
  "PersonaReferenceMap.ts",
);
// The encoder and the engine download once, outside the repository: a model is a dependency, not an output
export const MODELS_DIRECTORY: string =
  process.env.VOICE_MATCH_MODELS_DIRECTORY ?? join(tmpdir(), "esposter-voice-match", "models");
// What the speaker encoder expects
export const MODEL_SAMPLE_RATE = 16_000;
export const SPEAKER_MODEL_ID = "Xenova/wavlm-base-plus-sv";
// The frame an energy is read over, and the step between frames
export const FRAME_SECONDS = 0.04;
export const HOP_SECONDS = 0.01;
// Below the clip's loudest frame, what still counts as speech
export const SPEECH_FLOOR_DB = 35;
// The energy percentiles read as the speech level and the noise floor
export const SIGNAL_PERCENTILE = 0.9;
export const NOISE_PERCENTILE = 0.1;
// The embedding reads at most this much of a clip: a self-attention encoder's cost grows with the square of the
// Length, and the field's warning is that duration alone moves the score, so every clip is embedded over the same
// Opening seconds
export const MAX_EMBEDDED_SECONDS = 6;
// A clip shorter than this carries no voice to measure
export const MIN_CLIP_SECONDS = 1;
// A character with fewer usable clips than this is reported rather than profiled from a handful
export const MIN_PROFILE_CLIPS = 8;
// A reference has to carry a voice: at least this much speech, recorded this far above its own noise floor
export const MIN_REFERENCE_SECONDS = 3;
export const MIN_REFERENCE_SIGNAL_TO_NOISE_DB = 25;
// Every character's reference reads the same sentence, once, so the likeness compares across the roster. Two
// Sentences of the accent-elicitation passage the field records speakers with: about five seconds
export const CARRIER_TEXT = "Please call Stella. Ask her to bring these things with her from the store.";
// Two decimals hold a cosine as well as the ear can tell one clone from another
export const LIKENESS_DECIMALS = 2;
// The wiki answers this many titles in one imageinfo call
export const MAX_WIKI_TITLES_PER_QUERY = 50;
export const WRITE_FLAG = "--write";
// Asks the wiki for every stem the map already holds, in every dub, instead of measuring
export const CHECK_FLAG = "--check";
