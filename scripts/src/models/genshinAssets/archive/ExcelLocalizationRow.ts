// The fields read off one row of the game's localization table: its id, its kind as the table spells it, and the path of
// Each language's file the row names. The Chinese Simplified path is filed under the table's own key for it
export interface ExcelLocalizationRow {
  assetType: string;
  dePath: string;
  enPath: string;
  esPath: string;
  frPath: string;
  id: number;
  idPath: string;
  INAGBNHLPIE: string;
  itPath: string;
  jpPath: string;
  krPath: string;
  ptPath: string;
  ruPath: string;
  tcPath: string;
  thPath: string;
  trPath: string;
  viPath: string;
}
