import { PARITY_DIRECTORY } from "#src/services/genshinParity/constants";
import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { GameLanguage } from "genshin-text";
import { join } from "node:path";

// The game's text as the community dumps it per patch — `TextMap/` and `ExcelBinOutput/` as the AnimeGameData
// Repository lays them out — kept outside the repository like every other reference and never shipped. Only the
// Strings a consumer names, which `write` reads out of it, enter a package
export const GAME_TEXT_DIRECTORY: string = process.env.GENSHIN_TEXT_DIRECTORY ?? join(PARITY_DIRECTORY, "text");
export const TEXT_MAP_DIRECTORY: string = join(GAME_TEXT_DIRECTORY, "TextMap");
export const EXCEL_DIRECTORY: string = join(GAME_TEXT_DIRECTORY, "ExcelBinOutput");
export const MANUAL_TEXT_MAP_PATH: string = join(EXCEL_DIRECTORY, "ManualTextMapConfigData.json");
export const FETTERS_PATH: string = join(EXCEL_DIRECTORY, "FettersExcelConfigData.json");
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
  "services/GameLanguageTagMap.ts",
  "services/checkIsGameLanguage.ts",
  "services/getCanonicalLanguage.ts",
  "services/getLanguageDisplayName.ts",
];
