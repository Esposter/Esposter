import { TRPCError } from "@trpc/server";

// The one rejection a write from a session that is no longer current gets, so the client knows the game was started
// Somewhere else rather than that the save failed
export const getGenshinSessionReplacedError = (): TRPCError =>
  new TRPCError({ code: "CONFLICT", message: "The game was started in another session" });
