import { isAuthed } from "@@/server/trpc/middleware/isAuthed";
import { rateLimitedProcedure } from "@@/server/trpc/procedure/rateLimitedProcedure";

export const authedProcedure = rateLimitedProcedure.use(isAuthed);
