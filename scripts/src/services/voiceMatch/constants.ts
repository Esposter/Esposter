import { tmpdir } from "node:os";
import { join } from "node:path";

// Everything the stages write — the reference profiles, the candidate bank, the downloaded models — sits outside the
// Repository: the profiles are numbers read off game audio, and the rule that no clip is committed holds for a
// Cache exactly as it holds for a commit. The audio itself is never written anywhere, cache included; a clip is
// Decoded, measured and dropped
export const WORK_DIRECTORY: string = process.env.VOICE_MATCH_DIRECTORY ?? join(tmpdir(), "esposter-voice-match");
export const MODELS_DIRECTORY: string = join(WORK_DIRECTORY, "models");
export const REFERENCE_PATH: string = join(WORK_DIRECTORY, "reference.json");
export const BANK_PATH: string = join(WORK_DIRECTORY, "bank.json");
// Pretty-printed, so a run's numbers can be read and diffed by hand
export const JSON_INDENT = 2;
export const AKPK_MAGIC = "AKPK";
// The magic, the header size, the version and the four table sizes, four bytes each
export const AKPK_HEADER_BYTES = 28;
// A 64-bit id, then the block size, the file size, the start block and the language, four bytes each
export const AKPK_EXTERNAL_ENTRY_BYTES = 24;
export const AKPK_EXTERNAL_ID_BYTES = 8;
export const PACKAGE_EXTENSION = ".pck";
// A clip's id is the FNV-1 hash of its path as Wwise spells it: the language folder, backslashes, the
// Lowercased stem the game data records, and the streamed media extension. The language is inside the hash, which
// Is why no id is shared across the tracks
export const EXTERNAL_PATH_LANGUAGE = "japanese";
export const EXTERNAL_PATH_SEPARATOR = "\\";
export const EXTERNAL_PATH_EXTENSION = ".wem";
export const FNV1_64_OFFSET_BASIS = 0xcb_f2_9c_e4_84_22_23_25n;
export const FNV1_64_PRIME = 0x1_00_00_00_01_b3n;
export const UINT64_MASK = 0xff_ff_ff_ff_ff_ff_ff_ffn;
// The packages carry aoTuV codebooks. The library's default set produces a stream that throws nothing and decodes to
// Zero samples, so the variant is a constant to assert rather than a setting to tune
export const CODEBOOKS_VARIANT = "aoTuV_603";
// A line whose text names its speakers is a scene the game data attached to a character — the Traveler's are all
// Their companion's voice — and never that character's own line
export const SPEAKER_LABEL = "：";
// What the speaker encoder and the transcriber both expect
export const MODEL_SAMPLE_RATE = 16_000;
export const SPEAKER_MODEL_ID = "Xenova/wavlm-base-plus-sv";
export const TRANSCRIBER_MODEL_ID = "onnx-community/whisper-small";
export const TRANSCRIBER_DTYPE = "q8";
export const TRANSCRIBER_LANGUAGE = "english";
// A transcriber left to itself repeats a syllable for a whole minute on a grunt; the carrier is a short sentence
export const TRANSCRIBER_MAX_NEW_TOKENS = 64;
// The frame a pitch and an energy are read over, and the step between frames
export const FRAME_SECONDS = 0.04;
export const HOP_SECONDS = 0.01;
// The range a voice is looked for in; anything outside it is a harmonic or a rumble
export const MIN_F0_HZ = 70;
export const MAX_F0_HZ = 500;
// A frame is voiced when its best autocorrelation peak is this clear, and the first peak within this fraction of the
// Best is taken over the best — a sub-octave lag correlates almost as well, and picking it halves the pitch
export const MIN_CLARITY = 0.6;
export const OCTAVE_TOLERANCE = 0.85;
// Below the clip's loudest frame: what still counts as voiced, and what still counts as speech at all
export const VOICED_FLOOR_DB = 30;
export const SPEECH_FLOOR_DB = 35;
export const MEDIAN = 0.5;
// The energy percentiles read as the speech level and the noise floor
export const SIGNAL_PERCENTILE = 0.9;
export const NOISE_PERCENTILE = 0.1;
// A syllable nucleus is an energy peak with at least this much of a dip before it
export const SYLLABLE_DIP_DB = 2;
export const SEMITONES_PER_OCTAVE = 12;
export const MIN_CLIP_SECONDS = 1;
// A character with fewer usable clips than this is reported rather than profiled
export const MIN_REFERENCE_CLIPS = 8;
// Every candidate voice reads the same sentence at its own settings, once. Two sentences of the accent-elicitation
// Passage the field records speakers with: about five seconds, which is the length of a story line
export const CARRIER_TEXT = "Please call Stella. Ask her to bring these things with her from the store.";
export const MAX_WORD_ERROR_RATE = 0.2;
// The service's own clamps on the two prosody levers, as signed percentages
export const MAX_PITCH_SHIFT = 50;
export const MIN_RATE_SHIFT = -50;
export const MAX_RATE_SHIFT = 100;
// A pitch range this far from the character's is as wrong as a spread can be; it is the one prosody statistic no
// Markup lever corrects
export const SPREAD_TOLERANCE_SEMITONES = 6;
// The composite's weights, which the validation step tunes on its sample and nothing else does. Timbre dominates
// Because it is the one thing the levers cannot move; the shifts count because a large one degrades the voice even
// Inside the clamp
export const TIMBRE_WEIGHT = 0.6;
export const PITCH_WEIGHT = 0.15;
export const RATE_WEIGHT = 0.1;
export const SPREAD_WEIGHT = 0.15;
// Below this composite the benchmark could not fit the character, and the card is left to the ear
export const FIT_FLOOR = 0.7;
export const WRITE_FLAG = "--write";
