import type { GridEngine } from "grid-engine";

export type PositionChangeFinished = NonNullable<
  Parameters<ReturnType<GridEngine["positionChangeFinished"]>["subscribe"]>[0]
>;
