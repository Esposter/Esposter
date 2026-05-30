import type { CreateWSSContextFnOptions } from "@trpc/server/adapters/ws";
import type { H3Event } from "h3";

import { db } from "@@/server/db";

type Contexts = CreateWSSContextFnOptions | H3Event;

const isH3Event = (value: Contexts): value is H3Event => "runtime" in value;

export const createContext = (opts: Contexts) => {
  if (isH3Event(opts)) {
    const req = opts.runtime?.node?.req;
    const res = opts.runtime?.node?.res;
    return { db, headers: opts.req.headers, req, res };
  }

  const { req, res } = opts;
  return { db, headers: new Headers(Object.entries(req.headers as Record<string, string>)), req, res };
};

export type Context = ReturnType<typeof createContext>;
