import { z } from "zod";

// The last commit a machine's git identity landed on the queue, which its heartbeat carries so every machine's status
// Reads it: the commit's sha and when its author dated it. Read off git, so it needs no record of its own
export interface LastPush {
  at: string;
  sha: string;
}

export const lastPushSchema: z.ZodType<LastPush> = z.object({ at: z.iso.datetime({ offset: true }), sha: z.string() });
