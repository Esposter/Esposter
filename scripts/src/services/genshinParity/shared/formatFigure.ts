import { LoadFigureUnit } from "#src/models/genshinParity/page/LoadFigureUnit";
import { KIBIBYTE } from "@esposter/configuration";

export const formatFigure = (value: number, unit: LoadFigureUnit): string => {
  if (unit === LoadFigureUnit.Milliseconds) return `${value.toFixed(0)} ms`;
  if (unit === LoadFigureUnit.Kilobytes) return `${(value / KIBIBYTE).toFixed(1)} KB`;
  return `${value}`;
};
