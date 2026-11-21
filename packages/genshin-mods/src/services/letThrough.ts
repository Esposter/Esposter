import type { EngineInterface } from "claude-code";

// Any failure lets the hooked call through: a guard that blocked on its own failure would block every call after it.
// `next` is replay-safe where the hook had already decided, so a call the hook had already made is not made twice
export const letThrough = <E, R>(_$: EngineInterface, e: E, next: (e: E) => R): R => next(e);
