import type { Context } from "@@/server/trpc/context";

import { rootConfig } from "@@/server/trpc/rootConfig";
import { initTRPC } from "@trpc/server";

const t = initTRPC.context<Context>().create(rootConfig);

export const middleware = t.middleware;
export const router = t.router;
export const publicProcedure = t.procedure;
export const createCallerFactory = t.createCallerFactory;
