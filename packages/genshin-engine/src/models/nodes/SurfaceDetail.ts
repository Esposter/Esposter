// A surface's detail as the export's textures hold it, relative to their mean: the variance of its luminance, and the
// Mean square of each octave band's detail, finest first, which the material's noise is set to reproduce
export interface SurfaceDetail {
  bands: number[];
  variance: number;
}
