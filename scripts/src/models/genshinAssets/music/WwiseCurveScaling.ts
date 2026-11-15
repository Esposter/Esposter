// How a curve's stored values scale into its property's unit: unscaled, or decibels stored as an amplitude less one
export const WwiseCurveScaling = { None: 0, Decibels: 2 } as const;
export type WwiseCurveScaling = (typeof WwiseCurveScaling)[keyof typeof WwiseCurveScaling];
