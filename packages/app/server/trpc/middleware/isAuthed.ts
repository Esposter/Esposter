import { auth } from "@@/server/auth";
import { middleware } from "@@/server/trpc";
import { TRPCError } from "@trpc/server";

export const isAuthed = middleware(async ({ ctx: { headers }, next }) => {
  if (!headers) throw new TRPCError({ code: "UNAUTHORIZED" });
  const session = await auth.api.getSession({ headers });
  if (!session) throw new TRPCError({ code: "UNAUTHORIZED" });
  return next({ ctx: { session } });
});
