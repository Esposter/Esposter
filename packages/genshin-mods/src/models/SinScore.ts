import type { SinFigures } from "./SinFigures";
import type { SinName } from "./SinName";

export interface SinScore extends SinFigures {
  name: SinName;
  trend: number[];
}
