import type { ExcelExpeditionCondition } from "#src/models/genshinAssets/expeditions/ExcelExpeditionCondition";
import type { ExcelExpeditionDuration } from "#src/models/genshinAssets/expeditions/ExcelExpeditionDuration";

// One place of the game's expedition table: the nation it lies in, its name's text id, the conditions it opens by, and the
// Durations it offers with what each brings
export interface ExcelExpeditionDataRow {
  CHMIGIHPMFH: ExcelExpeditionCondition[];
  cityId: number;
  FPIOLKODPMI: ExcelExpeditionDuration[];
  id: number;
  nameTextMapHash: number;
}
