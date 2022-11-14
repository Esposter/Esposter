import type { inferAsyncReturnType } from "@trpc/server";
import type { H3Event } from "h3";

/**
 * Creates context for an incoming request
 * @link https://trpc.io/docs/context
 */
export const createContext = ({ req, res }: H3Event) => {
  // for API-response caching see https://trpc.io/docs/caching
  return {};
};

export type Context = inferAsyncReturnType<typeof createContext>;
