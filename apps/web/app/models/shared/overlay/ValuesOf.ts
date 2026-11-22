import type { KeyValue } from "#src/models/shared/overlay/KeyValue";

// Homomorphic over its own tuple parameter, so the key stays a tuple and each level keeps its column's value type
export type ValuesOf<TNames extends readonly PropertyKey[], TRow> = {
  [I in keyof TNames]: Extract<TRow[keyof TRow & TNames[I]], KeyValue>;
};
