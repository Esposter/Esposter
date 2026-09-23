import type { SessionState } from "#src/models/session/SessionState";

import { sessionStateSchema } from "#src/models/session/SessionState";
import { z } from "zod";

export interface SessionSummary {
  cwd: string;
  id: string;
  lastActivityAt: Date;
  state: SessionState;
  title: string;
}

export const sessionSummarySchema: z.ZodObject<{
  cwd: z.ZodString;
  id: z.ZodString;
  lastActivityAt: z.ZodCoercedDate;
  state: typeof sessionStateSchema;
  title: z.ZodString;
}> = z.object({
  cwd: z.string(),
  id: z.string().min(1),
  lastActivityAt: z.coerce.date(),
  state: sessionStateSchema,
  title: z.string(),
}) satisfies z.ZodType<SessionSummary>;
