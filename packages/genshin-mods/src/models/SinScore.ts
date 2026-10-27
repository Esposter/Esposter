import type { SinName } from "../services/sins/constants";
import type { SinFigures } from "./SinFigures";

export interface SinScore extends SinFigures {
  name: SinName;
  trend: number[];
}
