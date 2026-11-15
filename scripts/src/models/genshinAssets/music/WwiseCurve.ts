// A node's property driven by a game parameter: the parameter's id, whether it is a game parameter at all, the
// Property it drives, how the curve's values scale into the property's unit, and the curve's points, each from a
// Parameter value to a property value, eased to the next as its interpolation says. The property, scaling and
// Interpolation are codes as the bank holds them, a WwiseCurveParameter's, WwiseCurveScaling's and
// WwiseCurveInterpolation's or ones the tooling has not read, since a throw on one unknown code would abort the whole bank
export interface WwiseCurve {
  gameParameterId: number;
  isGameParameter: boolean;
  parameter: number;
  points: { from: number; interpolation: number; to: number }[];
  scaling: number;
}
