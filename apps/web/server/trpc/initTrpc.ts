import type { Meta } from "#server/models/trpc/Meta";
import type { Context } from "#server/trpc/context";

import { rootConfig } from "#server/trpc/rootConfig";
import { initTRPC } from "@trpc/server";

// The one tRPC instance the routers and their middlewares are built on. Apart from `index.ts`, which exports its builders,
// Nothing imports `index.ts` to build a middleware, so a middleware that the public procedure uses can live beside it
export const t = initTRPC.context<Context>().meta<Meta>().create(rootConfig);
