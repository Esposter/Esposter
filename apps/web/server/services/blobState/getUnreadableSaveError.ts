import { TRPCError } from "@trpc/server";

// The rejection a saved game that no longer parses answers with, so the save is never reset to a fresh game. The message
// Is stated, so the cause's own text never replaces it for the client
export const getUnreadableSaveError = (cause: Error): TRPCError =>
  new TRPCError({ cause, code: "INTERNAL_SERVER_ERROR", message: "The saved game could not be read" });
