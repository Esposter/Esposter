// One row of a scene's loss table: a view of the witness render, and its scores against the references, averaged over
// Them: the line distance between the towers' sides in pixels, the shape, the tone and the detail
export interface AttributionRow {
  detail: number;
  lineDistance: number;
  name: string;
  shape: number;
  tone: number;
}
