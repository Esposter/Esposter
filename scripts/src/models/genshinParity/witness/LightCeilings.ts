// What a frame's light ceilings report: the exports' frame as drawn, each correction's row, each height band by depth,
// And the map of the smooth field's ratio over the frame
export interface LightCeilings {
  depthEdges: readonly number[];
  drawn: number;
  heightBands: { bottom: number; cells: { count: number; exports: number; reference: number }[] }[];
  ratioMap: Buffer;
  rows: { frame: number; name: string }[];
}
