import type { SinName } from "./SinName";
import type { SinFigures } from "./SinFigures";

export interface SinScore extends SinFigures {
  name: SinName;
  trend: number[];
}
