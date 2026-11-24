import type { Meta } from "#server/models/trpc/Meta";
import type { Context } from "#server/trpc/context";

import { rootConfig } from "#server/trpc/rootConfig";
import { initTRPC } from "@trpc/server";

// The one tRPC instance the routers and their middlewares are built on.
// `index.ts` uses `inferTopicsMiddleware` for the public procedure, so that middleware builds on this file.
// Importing `index.ts` from it would be an import cycle.
export const t = initTRPC.context<Context>().meta<Meta>().create(rootConfig);
