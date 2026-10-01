import type { LayerScore } from "#src/models/genshinParity/LayerScore";

// One row of a scene's loss table: a view of the witness render, and its scores against the references layer by layer,
// The frame first, each averaged over the references that hold that layer
export interface AttributionRow {
  layers: LayerScore[];
  name: string;
}
