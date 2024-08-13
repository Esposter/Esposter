/**
 * The labelOrientation property specifies the desired position of a point's label, relative to the point itself.
 * This will override the calculator's default behavior of trying to position labels in such a way as to maintain legibility. To restore this behavior,
 * set the value back to Desmos.LabelOrientations.DEFAULT.
 * The default value is Desmos.LabelOrientations.DEFAULT.
 */
export enum LabelOrientations {
  ABOVE = "ABOVE",
  BELOW = "BELOW",
  DEFAULT = "DEFAULT",
  LEFT = "LEFT",
  RIGHT = "RIGHT",
}
