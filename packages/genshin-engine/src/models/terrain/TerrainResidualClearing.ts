// A disc a residual is kept out of: none of it inside the radius round its centre, faded in across the falloff past it
export interface TerrainResidualClearing {
  falloff: number;
  radius: number;
  x: number;
  z: number;
}
