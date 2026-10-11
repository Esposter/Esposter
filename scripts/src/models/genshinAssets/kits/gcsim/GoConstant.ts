import type { GoValue } from "#src/models/genshinAssets/kits/gcsim/GoValue";

// A constant or variable of a gcsim character's package as the evaluator reads it: its value, and the file and line it
// Is written on. A slice whose elements the package's `init` sets one by one keeps the line each is set on
export interface GoConstant {
  elementLines: Partial<Record<number, number>>;
  file: string;
  line: number;
  value: GoValue;
}
