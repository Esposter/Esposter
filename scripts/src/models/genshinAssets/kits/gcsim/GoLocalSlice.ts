import type { GoExpression } from "#src/models/genshinAssets/kits/gcsim/GoExpression";

// A local slice declared in a function, `ele := []attributes.Element{c.conversionElem, attributes.Anemo}`: its entries as
// Written, and the line its name is declared on
export interface GoLocalSlice {
  elements: GoExpression[];
  line: number;
}
