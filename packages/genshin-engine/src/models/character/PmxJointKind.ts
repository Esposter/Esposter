// The constraint a PMX joint holds between two rigid bodies, by the byte the file stores it as
export const PmxJointKind = {
  SpringSixDegreesOfFreedom: 0,
  SixDegreesOfFreedom: 1,
  PointToPoint: 2,
  ConeTwist: 3,
  Slider: 4,
  Hinge: 5,
} as const;
export type PmxJointKind = (typeof PmxJointKind)[keyof typeof PmxJointKind];
