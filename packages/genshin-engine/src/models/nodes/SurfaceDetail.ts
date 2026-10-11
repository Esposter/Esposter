// A surface's detail as the export's textures hold it, relative to their mean: the variance of its luminance, the mean
// Square of each octave band's detail, finest first, each band's sigmas counted in its texture's texels, and the metres a
// Texel spans where the texture is drawn, which the material's noise is set to reproduce at
export interface SurfaceDetail {
  bands: number[];
  metresPerTexel: number;
  variance: number;
}
