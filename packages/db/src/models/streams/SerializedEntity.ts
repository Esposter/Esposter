import type { CompositeKey } from "@esposter/azure";

// An entity in the form the client writes: arrays and objects as JSON strings and each Date as `{ date }`, so every
// value is one JSON already holds
export type SerializedEntity = CompositeKey & Record<string, unknown>;
