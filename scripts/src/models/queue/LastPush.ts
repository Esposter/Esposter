import { z } from "zod";

// The last push `pnpm ai:queue:push` made, which the machine's heartbeat carries so every machine's status reads it: when
// It landed, the commit it pushed and how many commits it carried. A push that carried nothing is never recorded
export interface LastPush {
  at: string;
  count: number;
  sha: string;
}

export const lastPushSchema: z.ZodType<LastPush> = z.object({
  at: z.iso.datetime(),
  count: z.int().positive(),
  sha: z.string(),
});
