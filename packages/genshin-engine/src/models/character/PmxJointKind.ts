// The constraint a PMX joint holds between two rigid bodies, by the byte the file stores it as
export enum PmxJointKind {
  SpringSixDegreesOfFreedom = 0,
  SixDegreesOfFreedom = 1,
  PointToPoint = 2,
  ConeTwist = 3,
  Slider = 4,
  Hinge = 5,
}
