import { getServerSession } from "#auth";
import { middleware } from "@/server/trpc";
import { TRPCError } from "@trpc/server";

export const isAuthed = middleware(async ({ ctx, next }) => {
  if (!ctx.event) throw new TRPCError({ code: "UNAUTHORIZED" });
  const session = await getServerSession(ctx.event);
  if (!session) throw new TRPCError({ code: "UNAUTHORIZED" });
  return next({ ctx: { session } });
});
