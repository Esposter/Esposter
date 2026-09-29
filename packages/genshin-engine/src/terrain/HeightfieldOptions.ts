export interface HeightfieldOptions {
  getHeight: (x: number, z: number) => number;
  // Vertices along each side, so the grid has one fewer cells than this along each side
  resolution: number;
  // The side's length in metres, centred on the origin
  size: number;
  // Writes the ground's colour at a point into the colours at the offset, as linear red, green and blue from 0 to 1,
  // Given its height and how steep it is from 0 when flat to 1 when sheer, so no colour is allocated per vertex
  writeColor: (colors: Float32Array, offset: number, height: number, slope: number, x: number, z: number) => void;
}
