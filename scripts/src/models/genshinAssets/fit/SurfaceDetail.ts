// A surface's detail as its export's texture holds it, relative to the texture's mean luminance so the numbers are
// Scale-free: the variance of its luminance, and the mean square of each octave band's detail, finest first, each
// Band's sigmas counted in the texture's texels; and the metres a texel spans where the texture is drawn, which sets
// The world's scale its octaves are drawn at
export interface SurfaceDetail {
  bands: number[];
  metresPerTexel: number;
  variance: number;
}
