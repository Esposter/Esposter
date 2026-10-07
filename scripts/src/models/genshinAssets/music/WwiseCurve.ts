import type { WwiseCurveInterpolation } from "#src/models/genshinAssets/music/WwiseCurveInterpolation";
import type { WwiseCurveParameter } from "#src/models/genshinAssets/music/WwiseCurveParameter";
import type { WwiseCurveScaling } from "#src/models/genshinAssets/music/WwiseCurveScaling";

// A node's property driven by a game parameter: the parameter's id, whether it is a game parameter at all, the
// Property it drives, how the curve's values scale into the property's unit, and the curve's points, each from a
// Parameter value to a property value, eased to the next as its interpolation says
export interface WwiseCurve {
  gameParameterId: number;
  isGameParameter: boolean;
  parameter: WwiseCurveParameter;
  points: { from: number; interpolation: WwiseCurveInterpolation; to: number }[];
  scaling: WwiseCurveScaling;
}
