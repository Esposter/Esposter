import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { tmpdir } from "node:os";
import { join } from "node:path";

// The two stages' outputs are generated artifacts and are committed as such (/docs/architecture/generated-artifacts),
// One file per character and per voice: profiles that are numbers, read off audio that is never written anywhere —
// A clip is decoded, measured and dropped, cache included, since the rule that no game audio enters the repository
// Holds for a temporary folder exactly as for a commit
const GENERATED_DIRECTORY = join(REPOSITORY_ROOT, "scripts", "src", "generated", "voiceMatch");
// One sub-folder per language track profiled, named by the language's tag
export const REFERENCES_DIRECTORY: string = join(GENERATED_DIRECTORY, "reference");
export const BANK_DIRECTORY: string = join(GENERATED_DIRECTORY, "bank");
export const GENERATED_JSON_EXTENSION = ".json";
// The characters Windows refuses in a file name; a ":" would otherwise make the rest of the name an alternate
// Data stream on an empty file, silently (the catalogue's "en-au-andrew:DragonHDOmniLatestNeural")
// oxlint-disable-next-line typescript/no-inferrable-types -- `isolatedDeclarations` demands the annotation this regex would otherwise infer
export const UNSAFE_FILE_NAME_CHARACTERS_REGEX: RegExp = /[<>:"/\\|?*]/gu;
export const FILE_NAME_CHARACTER_REPLACEMENT = "-";
// The encoder and the recogniser download once, outside the repository: a model is a dependency, not an output
export const MODELS_DIRECTORY: string =
  process.env.VOICE_MATCH_MODELS_DIRECTORY ?? join(tmpdir(), "esposter-voice-match", "models");
// Four decimals hold a cosine to a ten-thousandth and keep a committed embedding a third of the size
export const EMBEDDING_DECIMALS = 4;
// Pretty-printed, so a run's numbers can be read and diffed by hand
export const JSON_INDENT = 2;
export const AKPK_MAGIC = "AKPK";
// The magic, the header size, the version and the four table sizes, four bytes each
export const AKPK_HEADER_BYTES = 28;
// A 64-bit id, then the block size, the file size, the start block and the language, four bytes each
export const AKPK_EXTERNAL_ENTRY_BYTES = 24;
export const AKPK_EXTERNAL_ID_BYTES = 8;
export const PACKAGE_EXTENSION = ".pck";
// The game's audio tracks, by the folder each is installed under and the tag of the language it speaks. A clip's id is
// The FNV-1 hash of its path as Wwise spells it: that folder lowercased, backslashes, the lowercased stem the game
// Data records, and the streamed media extension — the language is inside the hash, which is why no id is shared
// Across the tracks
export const AUDIO_TRACK_LANGUAGES: Record<string, string> = { Chinese: "zh", "English(US)": "en", Japanese: "ja" };
export const EXTERNAL_PATH_SEPARATOR = "\\";
export const EXTERNAL_PATH_EXTENSION = ".wem";
export const FNV1_64_OFFSET_BASIS = 0xcb_f2_9c_e4_84_22_23_25n;
export const FNV1_64_PRIME = 0x1_00_00_00_01_b3n;
export const UINT64_MASK = 0xff_ff_ff_ff_ff_ff_ff_ffn;
// The packages carry aoTuV codebooks. The library's default set produces a stream that throws nothing and decodes to
// Zero samples, so the variant is a constant to assert rather than a setting to tune
export const CODEBOOKS_VARIANT = "aoTuV_603";
// A line whose text opens with a speaker's name and a colon is a scene the game data attached to a character — the
// Traveler's companion, a character's familiar — and carries another actor's voice, so it is never that character's
// Own line. The name is one word in every language's text, which keeps a colon inside a sentence from reading as one
// oxlint-disable-next-line typescript/no-inferrable-types -- `isolatedDeclarations` demands the annotation this regex would otherwise infer
export const SPEAKER_LABEL_REGEX: RegExp = /^[^\s:：]{1,20}[:：]/mu;
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
export const PERCENT = 100;
export const MIN_CLIP_SECONDS = 1;
// The embedding reads at most this much of a clip: a self-attention encoder's cost grows with the square of the
// Length, so the story lines would be most of the run — and the field's warning is that duration alone moves the
// Score, so every reference clip is held near the carrier's length rather than measured at its own
export const MAX_EMBEDDED_SECONDS = 6;
// A character with fewer usable clips than this is reported rather than profiled
export const MIN_REFERENCE_CLIPS = 8;
// Every candidate voice reads the same sentence at its own settings, once. Two sentences of the accent-elicitation
// Passage the field records speakers with: about five seconds, which is the length of a story line
export const CARRIER_TEXT = "Please call Stella. Ask her to bring these things with her from the store.";
export const MAX_WORD_ERROR_RATE = 0.2;
// The reference track and the pool speak one language, and the plugin speaks English, so it is English on both
// Sides: the English track's reference, against the voices whose short name opens with the tag. A speaker embedding
// Is biased towards the language it hears — the first run, the Japanese track against the whole catalogue, chose
// Voices of a third locale by that bias — and a voice reading a language not its own carries an accent the ear
// Rejected. The bank holds the whole catalogue and the reference folder holds every track profiled, so the language
// Moves without a run
export const MATCH_LANGUAGE = "en";
export const LOCALE_SEPARATOR = "-";
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
// Below this composite the benchmark could not fit the character, and the card is left to the ear. Every best fit in
// The settled pool clears it by a wide margin; a pool of a handful of voices left a character or two under, whose
// Pitch sat far from every voice in it. Like the weights, it moves on the ear-validated sample alone
export const FIT_FLOOR = 0.7;
export const WRITE_FLAG = "--write";
// A stage keeps the last run's record for an entity it would otherwise measure again, since a measurement costs
// Minutes or synthesis characters and the source it was taken from has not moved. The flag measures everything again,
// Which a changed carrier, encoder or recogniser calls for
export const FRESH_FLAG = "--fresh";
