// One family's surface as its export paints it: its colour as hex, the area-weighted mean of what its textures show, and
// The palette of the tones they carry, each as hex with the share of the family's area it covers, darkest first
export interface FittedSurface {
  color: string;
  palette: { color: string; share: number }[];
}
