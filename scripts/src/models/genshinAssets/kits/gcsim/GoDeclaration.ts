import type { GoExpression } from "#src/models/genshinAssets/kits/gcsim/GoExpression";

// A constant or variable of a gcsim character's package as declared or assigned whole: the expression it is given, and
// The file and line it is given on
export interface GoDeclaration {
  expression: GoExpression;
  file: string;
  line: number;
}
