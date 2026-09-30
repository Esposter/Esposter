// A band of painted clouds scattered round a centre, in metres: how many, the heights their middles sit between, the
// Distances out from the centre they lie between, the widths they are drawn at, and the seed that places them
export interface CloudBandOptions {
  count: number;
  distanceRange: [number, number];
  heightRange: [number, number];
  seed: number;
  widthRange: [number, number];
}
