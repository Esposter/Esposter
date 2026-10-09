import { GAME_EXECUTABLE_PATH, PARITY_DIRECTORY } from "#src/services/genshinParity/shared/constants";
import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { GameLanguage } from "genshin-text";
import { dirname, join } from "node:path";

// The game's text kept outside the repository like every other reference and never shipped: `ExcelBinOutput/` as the
// AnimeGameData Repository lays it out per patch, and `TextMap/`, which `decode` writes from the installed game's own
// Chunks. Only the strings a consumer names, which `write` reads out of it, enter a package
export const GAME_TEXT_DIRECTORY: string = process.env.GENSHIN_TEXT_DIRECTORY ?? join(PARITY_DIRECTORY, "text");
export const TEXT_MAP_DIRECTORY: string = join(GAME_TEXT_DIRECTORY, "TextMap");
export const EXCEL_DIRECTORY: string = join(GAME_TEXT_DIRECTORY, "ExcelBinOutput");
// The readable texts the game's books and letters are read from, one folder a language named by its code, fetched into the
// Dump from the AnimeGameData repository's `Readable/` like the tables, never committed
export const READABLE_DIRECTORY: string = join(GAME_TEXT_DIRECTORY, "Readable");
export const MANUAL_TEXT_MAP_PATH: string = join(EXCEL_DIRECTORY, "ManualTextMapConfigData.json");
export const FETTERS_PATH: string = join(EXCEL_DIRECTORY, "FettersExcelConfigData.json");
// The quest, dialog and character tables a quest's steps and talks are read from, and the binary output holding each
// Quest's steps under its id
export const MAIN_QUEST_PATH: string = join(EXCEL_DIRECTORY, "MainQuestExcelConfigData.json");
export const DIALOG_PATH: string = join(EXCEL_DIRECTORY, "DialogExcelConfigData.json");
export const NPC_PATH: string = join(EXCEL_DIRECTORY, "NpcExcelConfigData.json");
export const QUEST_BINARY_DIRECTORY: string = join(GAME_TEXT_DIRECTORY, "BinOutput", "Quest");
// The install's text chunks sit under this folder, each a MiHoYoBinData named by the path it is built from, and each
// Text map is split across the chunks of its kind's folder, numbered from its range's first to its last
export const EXCEL_BIN_OUTPUT_PATH = "Data/_ExcelBinOutput";
export const TextMapChunkRangeMap: Record<string, { first: number; last: number }> = {
  TextMap: { first: 512, last: 1023 },
  TextMap_Medium: { first: 0, last: 511 },
};
// The TextMap's obfuscation as the owomocha devkit (MIT, github.com/owomocha/genshin-7.0-local-re-devkit) decodes it for
// 7.0.0: the entry count is masked by an addend and an XOR; each entry's key and length are the low and high halves of
// A 64-bit mixer's output, keyed by the entry's index and by the key; and each body is the bytes of its length, padded
// To eight, each word added to the length's mixer output
export const TEXT_MAP_COUNT_ADDEND = 0x57f28181;
export const TEXT_MAP_COUNT_XOR = 0xdf7f775a;
export const TEXT_MAP_MAX_COUNT = 4_000_000;
export const TEXT_MAP_KEY_FINISH = 0x3fb6960056f173c2n;
export const TEXT_MAP_LENGTH_FINISH = 0x873aa2af7e6c0c67n;
export const TEXT_MAP_MIXER_FIRST_MULTIPLIER = 0xc2b2ae3d27d4eb4fn;
export const TEXT_MAP_MIXER_FIRST_ADDEND = 0xaef8026097596711n;
export const TEXT_MAP_MIXER_SECOND_MULTIPLIER = 0x9e3779b185ebca87n;
export const TEXT_MAP_MIXER_SECOND_ADDEND = 0x3020e9bdf1cb30ffn;
export const TEXT_MAP_MIXER_XOR = 0x7fcdb9dfc6a6de1dn;
export const TEXT_MAP_MIXER_THIRD_MULTIPLIER = 0x441e34c8d03cabe3n;
export const TEXT_MAP_MIXER_ROTATION = 31n;
// A dialog's own id sits under one of the names the dump scrambles, eleven capitals
// oxlint-disable-next-line typescript/no-inferrable-types -- `isolatedDeclarations` demands the annotation this pattern would otherwise infer
export const SCRAMBLED_KEY_REGEX: RegExp = /^[A-Z]{11}$/u;
// The code each language's text map is filed under; the largest are split into numbered parts
export const GameLanguageCodeMap: Record<GameLanguage, string> = {
  [GameLanguage.ChineseSimplified]: "CHS",
  [GameLanguage.ChineseTraditional]: "CHT",
  [GameLanguage.English]: "EN",
  [GameLanguage.French]: "FR",
  [GameLanguage.German]: "DE",
  [GameLanguage.Indonesian]: "ID",
  [GameLanguage.Italian]: "IT",
  [GameLanguage.Japanese]: "JP",
  [GameLanguage.Korean]: "KR",
  [GameLanguage.Portuguese]: "PT",
  [GameLanguage.Russian]: "RU",
  [GameLanguage.Spanish]: "ES",
  [GameLanguage.Thai]: "TH",
  [GameLanguage.Turkish]: "TR",
  [GameLanguage.Vietnamese]: "VI",
};
// A fetter of this type is one of a character's voice-over lines, the ones their profile lists; the other type is
// What they say in combat
export const VOICE_LINE_FETTER_TYPE = 1;
export const GENSHIN_TEXT_SOURCE_DIRECTORY: string = join(REPOSITORY_ROOT, "packages", "genshin-text", "src");
export const GENSHIN_TEXT_GENERATED_DIRECTORY: string = join(GENSHIN_TEXT_SOURCE_DIRECTORY, "generated");
// Where the world's quests are written, one file a quest, and their words, one chunk a language; and the names its stat
// Tables cite, one chunk a language
const GENSHIN_WORLD_GENERATED_DIRECTORY: string = join(
  REPOSITORY_ROOT,
  "packages",
  "genshin-world",
  "src",
  "generated",
);
export const QUESTS_DIRECTORY: string = join(GENSHIN_WORLD_GENERATED_DIRECTORY, "quests");
export const QUEST_TEXT_DIRECTORY: string = join(GENSHIN_WORLD_GENERATED_DIRECTORY, "questText");
export const NAME_TEXT_DIRECTORY: string = join(GENSHIN_WORLD_GENERATED_DIRECTORY, "nameText");
const PERSONA_GENERATED_DIRECTORY: string = join(REPOSITORY_ROOT, "packages", "genshin-persona", "src", "generated");
export const CHARACTER_LINES_DIRECTORY: string = join(PERSONA_GENERATED_DIRECTORY, "characterLines");
// The persona is installed alone by a stranger's `npm ci` and so takes no workspace package; it gets a copy of the
// Modules of `genshin-text` it runs, its own alias prefix in place of the package's
export const PERSONA_COPY_DIRECTORY: string = join(PERSONA_GENERATED_DIRECTORY, "genshinText");
export const PersonaCopiedModules: string[] = [
  "generated/GameTextLoaderMap.ts",
  "models/GameLanguage.ts",
  "models/GameText.ts",
  "models/GameTextKey.ts",
  "models/TravelerGender.ts",
  "services/GameLanguageTagMap.ts",
  "services/checkIsGameLanguage.ts",
  "services/fillLinePlaceholders.ts",
  "services/getCanonicalLanguage.ts",
  "services/getLanguageDisplayName.ts",
];
// The account kit's own strings, which the game shows before it has loaded its text map (the welcome as the player
// Signs in): a table per language in the kit's resource bundle beside the game, exported by AnimeStudio into the dump
// The first time a write needs them, and read as references like the text map
export const SDK_BUNDLE_PATH: string = join(
  dirname(GAME_EXECUTABLE_PATH),
  "GenshinImpact_Data",
  "StreamingAssets",
  "MiHoYoSDKRes",
  "PC",
  "mihoyo_sdk_res",
);
export const SDK_TEXT_DIRECTORY: string = join(GAME_TEXT_DIRECTORY, "Sdk");
export const SDK_LANGUAGE_DIRECTORY: string = join(
  SDK_TEXT_DIRECTORY,
  "assets",
  "plugins",
  "mihoyosdk",
  "resources",
  "language",
);
// The file each language's account kit strings are in
export const GameLanguageSdkFileMap: Record<GameLanguage, string> = {
  [GameLanguage.ChineseSimplified]: "zh-cn",
  [GameLanguage.ChineseTraditional]: "zh-tw",
  [GameLanguage.English]: "en",
  [GameLanguage.French]: "fr",
  [GameLanguage.German]: "de",
  [GameLanguage.Indonesian]: "id",
  [GameLanguage.Italian]: "it",
  [GameLanguage.Japanese]: "ja",
  [GameLanguage.Korean]: "ko",
  [GameLanguage.Portuguese]: "pt",
  [GameLanguage.Russian]: "ru",
  [GameLanguage.Spanish]: "es",
  [GameLanguage.Thai]: "th",
  [GameLanguage.Turkish]: "tr",
  [GameLanguage.Vietnamese]: "vi",
};
