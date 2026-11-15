// How a curve eases from one of its points to the next, by the value a bank stores it as; the others ease by shapes
// No volume curve the tooling has read uses
export const WwiseCurveInterpolation = { Linear: 4, Constant: 9 } as const;
export type WwiseCurveInterpolation = (typeof WwiseCurveInterpolation)[keyof typeof WwiseCurveInterpolation];
