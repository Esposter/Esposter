import type { Promisable } from "type-fest";

export type AnyHook = (...args: never[]) => Promisable<void>;
