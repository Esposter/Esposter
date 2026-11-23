import { t } from "#server/trpc/initTrpc";
import { inferTopicsMiddleware } from "#server/trpc/middleware/inferTopicsMiddleware";

export const middleware = t.middleware;
export const router = t.router;
// Every procedure infers its live topics from the statements it awaits, unless it declares why it has none
// (`staticReason`)
export const publicProcedure = t.procedure.use(inferTopicsMiddleware);
export const createCallerFactory = t.createCallerFactory;
