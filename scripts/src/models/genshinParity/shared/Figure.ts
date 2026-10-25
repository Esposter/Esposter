import type { LoadFigureUnit } from "#src/models/genshinParity/page/LoadFigureUnit";

export interface Figure {
  budget?: number;
  // Whether the figure is checked here: a count always is, a time only on the machine its budget names
  isChecked: boolean;
  name: string;
  unit: LoadFigureUnit;
  value: number;
}
