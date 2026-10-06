// One curve of a decoded clip: the object it moves by its path's CRC32 and by the path that resolves to (the CRC32
// Again where none does), the component type and the property it moves (a name where it resolves, otherwise its
// CRC32), the component of a vector it is (x, y, z or w, empty for a single value), and its value sampled at the
// Decode's rate from the clip's start
export interface DecodedCurve {
  component: string;
  path: string;
  pathHash: number;
  property: string;
  samples: number[];
  type: string;
}
