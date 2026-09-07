/**
 * The dragMode of a point determines whether it can be changed by dragging in the x direction, the y direction,
 * both, or neither.
 * In addition, a point may have its dragMode set to Desmos.DragModes.AUTO, in which case the normal calculator rules
 * for determining point behavior will be applied. For example, a point whose coordinates are both slider variables would
 * be draggable in both the x and y directions.
 * The dragMode of a table column determines the behavior of the points represented by the column. The dragMode is only applicable
 * to explicitly specified column values, and has no effect on computed column values.
 */
export enum DragModes {
  AUTO = "AUTO",
  NONE = "NONE",
  X = "X",
  XY = "XY",
  Y = "Y",
}
