import type { GridEngine } from "grid-engine";

export type MovementStopped = NonNullable<Parameters<ReturnType<GridEngine["movementStopped"]>["subscribe"]>[0]>;
