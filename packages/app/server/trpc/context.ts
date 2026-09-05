import type { CreateWSSContextFnOptions } from "@trpc/server/adapters/ws";
import type { H3Event } from "h3";

import { db } from "@@/server/db";

type ContextInput = CreateWSSContextFnOptions | H3EventInput;
// `trpc-nuxt` bundles its own copy of h3's H3Event declaration, which misses nitro's augmentations, so we
// Structurally accept only the members we read instead of h3's H3Event itself.
type H3EventInput = Pick<H3Event, "headers" | "node">;

const checkIsH3Event = (value: ContextInput): value is H3EventInput => "node" in value;

export const createContext = (options: ContextInput) => {
  if (checkIsH3Event(options)) {
    const {
      headers,
      node: { req, res },
    } = options;
    return { db, headers, req, res };
  }

  const { req, res } = options;
  return { db, headers: new Headers(Object.entries(req.headers as Record<string, string>)), req, res };
};

export type Context = ReturnType<typeof createContext>;
