// A surface's detail as its export's texture holds it, relative to the texture's mean luminance so the numbers are
// Scale-free: the variance of its luminance, and the mean square of each octave band's detail, finest first
export interface SurfaceDetail {
  bands: number[];
  variance: number;
}
