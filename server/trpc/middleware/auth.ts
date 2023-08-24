// import { getServerSession } from "#auth";
import { middleware } from "@/server/trpc";
import { TRPCError } from "@trpc/server";
import type { Session } from "next-auth";
import { NIL } from "uuid";

export const isAuthed = middleware(({ ctx, next }) => {
  if (!ctx.event) throw new TRPCError({ code: "UNAUTHORIZED" });
  // @NOTE: Cannot import from #auth right now
  // const session = await getServerSession(ctx.event);
  // if (!session) throw new TRPCError({ code: "UNAUTHORIZED" });
  const session: Session = { user: { id: NIL }, expires: "" };
  return next({ ctx: { session } });
});
