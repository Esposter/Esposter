import type { CreateWSSContextFnOptions } from "@trpc/server/adapters/ws";
import type { H3Event } from "h3";

import { useDb } from "@@/server/composables/useDb";

type Contexts = CreateWSSContextFnOptions | H3Event;

const isH3Event = (value: Contexts): value is H3Event => "node" in value;

export const createContext = (opts: Contexts) => {
  const db = useDb();

  if (isH3Event(opts)) {
    const {
      headers,
      node: { req, res },
    } = opts;
    return { db, headers, req, res };
  }

  const { req, res } = opts;
  return { db, headers: new Headers(Object.entries(req.headers as Record<string, string>)), req, res };
};

export type Context = ReturnType<typeof createContext>;
