import type { GoDeclaration } from "#src/models/genshinAssets/kits/gcsim/GoDeclaration";
import type { GoExpression } from "#src/models/genshinAssets/kits/gcsim/GoExpression";

// An element of a slice the package's `init` assigns one at a time, `attackFrames[0] = ...`: the slice's name and the
// Indexes into it
export interface GoElementAssignment extends GoDeclaration {
  indexes: GoExpression[];
  name: string;
}
