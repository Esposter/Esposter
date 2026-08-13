import type { CreateWSSContextFnOptions } from "@trpc/server/adapters/ws";
import type { H3Event } from "h3";

import { db } from "@@/server/db";

// trpc-nuxt bundles its own copy of h3's H3Event declaration, which misses nitro's augmentations,
// so we structurally accept only the members we read instead of h3's H3Event itself.
type H3EventInput = Pick<H3Event, "headers" | "node">;

type Contexts = CreateWSSContextFnOptions | H3EventInput;

const isH3Event = (value: Contexts): value is H3EventInput => "node" in value;

export const createContext = (opts: Contexts) => {
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
