// A white balance as Unity's post-processing sets one: how far the white point is cooled or warmed, and how far it is
// Tinted toward green or magenta, each from minus to plus a hundred, none at none
export interface WhiteBalance {
  temperature: number;
  tint: number;
}
