import type { z } from "zod";

import { createPageInputSchema, SCHEDULED_MESSAGE_JOB_PAGE_SORT } from "@esposter/db-schema";

// The Scheduled tab's first page is read with no input at all, so an absent input parses as the defaults
export const readMyScheduledMessagesInputSchema = createPageInputSchema(SCHEDULED_MESSAGE_JOB_PAGE_SORT).prefault({});
export type ReadMyScheduledMessagesInput = z.infer<typeof readMyScheduledMessagesInputSchema>;
