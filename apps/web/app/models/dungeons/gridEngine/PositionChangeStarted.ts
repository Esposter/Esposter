import type { GridEngine } from "grid-engine";

export type PositionChangeStarted = NonNullable<
  Parameters<ReturnType<GridEngine["positionChangeStarted"]>["subscribe"]>[0]
>;
