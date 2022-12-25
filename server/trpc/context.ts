import type { inferAsyncReturnType } from "@trpc/server";
import type { NodeHTTPCreateContextFnOptions } from "@trpc/server/adapters/node-http";
import type { H3Event } from "h3";
import type { IncomingMessage } from "http";
import ws from "ws";

type Contexts = H3Event | NodeHTTPCreateContextFnOptions<IncomingMessage, ws>;

const isH3Event = (value: Contexts): value is H3Event => "node" in value;

export const createContext = (opts: Contexts) => {
  if (isH3Event(opts)) {
    const {
      node: { req, res },
    } = opts;
    return { req, res, event: opts };
  }

  const { req, res } = opts as NodeHTTPCreateContextFnOptions<IncomingMessage, ws>;
  return { req, res };
};

export type Context = inferAsyncReturnType<typeof createContext>;
