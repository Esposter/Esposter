import { z } from "zod";

// The automatic action taken when a message matches the room's word filter. Reject is the default
// (block the message with an error) — Warn and Timeout additionally record a moderation action.
export const WordFilterAction = { Reject: "Reject", Timeout: "Timeout", Warn: "Warn" } as const;
export type WordFilterAction = (typeof WordFilterAction)[keyof typeof WordFilterAction];

export const wordFilterActionSchema = z.enum(WordFilterAction) satisfies z.ZodType<WordFilterAction>;

export const WordFilterActions: readonly WordFilterAction[] = Object.values(WordFilterAction);
