// One level of a curve table, each curve's multiplier at it
export interface ExcelCurveRow {
  curveInfos: { type: string; value: number }[];
  level: number;
}
