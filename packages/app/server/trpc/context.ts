import type { inferAsyncReturnType } from "@trpc/server";
import type { CreateWSSContextFnOptions } from "@trpc/server/adapters/ws";
import type { H3Event } from "h3";

type Contexts = CreateWSSContextFnOptions | H3Event;

const isH3Event = (value: Contexts): value is H3Event => "node" in value;

export const createContext = (opts: Contexts) => {
  if (isH3Event(opts)) {
    const {
      node: { req, res },
    } = opts;
    return { event: opts, req, res };
  }

  const { req, res } = opts;
  return { req, res };
};

export type Context = inferAsyncReturnType<typeof createContext>;
