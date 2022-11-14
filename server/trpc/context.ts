import type { inferAsyncReturnType } from "@trpc/server";
import type { H3Event } from "h3";

export const createContext = ({ req, res }: H3Event) => ({ req, res });

export type Context = inferAsyncReturnType<typeof createContext>;
