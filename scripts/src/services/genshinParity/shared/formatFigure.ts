import { LoadFigureUnit } from "#src/models/genshinParity/page/LoadFigureUnit";

const BYTES_PER_KILOBYTE = 1024;

export const formatFigure = (value: number, unit: LoadFigureUnit): string => {
  if (unit === LoadFigureUnit.Milliseconds) return `${value.toFixed(0)} ms`;
  if (unit === LoadFigureUnit.Kilobytes) return `${(value / BYTES_PER_KILOBYTE).toFixed(1)} KB`;
  return `${value}`;
};
