import { getServerSession } from "#auth";
import { authOptions } from "@/server/api/auth/[...]";
import { middleware } from "@/server/trpc";
import { TRPCError } from "@trpc/server";

export const isAuthed = middleware(async ({ ctx, next }) => {
  if (!ctx.event) throw new TRPCError({ code: "UNAUTHORIZED" });
  const session = await getServerSession(ctx.event, authOptions);
  if (!session) throw new TRPCError({ code: "UNAUTHORIZED" });
  return next({ ctx: { session } });
});
