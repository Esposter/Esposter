import type { CurveInfo } from "#src/models/genshinAssets/shared/CurveInfo";

// One level of a curve table, each curve's multiplier at it
export interface ExcelCurveRow {
  curveInfos: CurveInfo[];
  level: number;
}
