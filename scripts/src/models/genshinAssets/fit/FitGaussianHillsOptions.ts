export interface FitGaussianHillsOptions {
  // The distances from the centre each error is reported within
  bands: readonly number[];
  center: readonly [number, number];
  // How far from the centre a sample weighs half as much as one at the centre
  falloff: number;
  getHeight: (x: number, z: number) => number;
  radius: number;
  step: number;
  // The hills' widths, widest first
  widths: readonly number[];
}
