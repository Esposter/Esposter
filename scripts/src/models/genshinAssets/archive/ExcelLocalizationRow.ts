// The fields read off one row of the game's localization table: its id, its kind, which the dump leaves unnamed under
// Its field number, and the path of each language's file the row names. The Chinese Simplified path is filed under the
// Table's own key for it
export interface ExcelLocalizationRow {
  dePath: string;
  enPath: string;
  esPath: string;
  frPath: string;
  id: number;
  idPath: string;
  itPath: string;
  jpPath: string;
  krPath: string;
  MBOPLLJEHCJ: string;
  ptPath: string;
  ruPath: string;
  tcPath: string;
  thPath: string;
  trPath: string;
  unnamed84: number;
  viPath: string;
}
