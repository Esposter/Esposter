export interface WorldFeature {
  geometry: { coordinates: number[][][] | number[][][][]; type: "MultiPolygon" | "Polygon" };
}
