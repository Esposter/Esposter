import { initTRPC } from "@trpc/server";

// Avoid exporting the entire t-object since it's not very
// descriptive and can be confusing to newcomers used to t
// meaning translation in i18n libraries.
const t = initTRPC.create();

export const middleware = t.middleware;
export const router = t.router;
export const publicProcedure = t.procedure;
