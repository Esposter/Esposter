import type { GridEngine } from "grid-engine";

export type MovementStarted = NonNullable<Parameters<ReturnType<GridEngine["movementStarted"]>["subscribe"]>[0]>;
