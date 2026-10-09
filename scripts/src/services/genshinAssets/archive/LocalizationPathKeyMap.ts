import type { ExcelLocalizationRow } from "#src/models/genshinAssets/archive/ExcelLocalizationRow";

import { GameLanguage } from "genshin-text";

// The field of a localization row that names each language's readable text, by the table's own key for it
export const LocalizationPathKeyMap: Record<GameLanguage, Exclude<keyof ExcelLocalizationRow, "assetType" | "id">> = {
  [GameLanguage.ChineseSimplified]: "INAGBNHLPIE",
  [GameLanguage.ChineseTraditional]: "tcPath",
  [GameLanguage.English]: "enPath",
  [GameLanguage.French]: "frPath",
  [GameLanguage.German]: "dePath",
  [GameLanguage.Indonesian]: "idPath",
  [GameLanguage.Italian]: "itPath",
  [GameLanguage.Japanese]: "jpPath",
  [GameLanguage.Korean]: "krPath",
  [GameLanguage.Portuguese]: "ptPath",
  [GameLanguage.Russian]: "ruPath",
  [GameLanguage.Spanish]: "esPath",
  [GameLanguage.Thai]: "thPath",
  [GameLanguage.Turkish]: "trPath",
  [GameLanguage.Vietnamese]: "viPath",
};
