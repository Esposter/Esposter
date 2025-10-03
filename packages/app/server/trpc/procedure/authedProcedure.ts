import { publicProcedure } from "@@/server/trpc";
import { isAuthed } from "@@/server/trpc/middleware/isAuthed";

export const authedProcedure = publicProcedure.use(isAuthed);
