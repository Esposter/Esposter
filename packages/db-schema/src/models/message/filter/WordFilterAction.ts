import { z } from "zod";

// The automatic action taken when a message matches the room's word filter. Reject is the default
// (block the message with an error) — Warn and Timeout additionally record a moderation action.
export enum WordFilterAction {
  Reject = "Reject",
  Timeout = "Timeout",
  Warn = "Warn",
}

export const wordFilterActionSchema = z.enum(WordFilterAction) satisfies z.ZodType<WordFilterAction>;
