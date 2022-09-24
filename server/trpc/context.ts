import type { inferAsyncReturnType } from "@trpc/server";
import type { CompatibilityEvent } from "h3";

export const createContext = (_: CompatibilityEvent) => ({});

export type Context = inferAsyncReturnType<typeof createContext>;
