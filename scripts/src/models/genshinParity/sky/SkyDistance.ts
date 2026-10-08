// How far apart two skies' statistics stand (`SkyStatistics`), each in its own unit: their clouds' brightness over
// Their clear sky as the logarithm of the two ratios' ratio, their clear sky's and their clouds' colours each as the
// CIELab distance, their
// Cover as the mean share it stands apart band by band of height, and their edges' sharpness and their spread each
// As the share of the step from the sky to the cloud
export interface SkyDistance {
  brightness: number;
  cloudColour: number;
  colour: number;
  cover: number;
  edgeSharpness: number;
  spread: number;
}
