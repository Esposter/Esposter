import type { z } from "zod";

import { createPageInputSchema, SENT_MESSAGE_PAGE_SORT } from "@esposter/db-schema";

// The caller's sent messages newest first, from the cursor the last page answered
export const readMySentMessagesInputSchema = createPageInputSchema(SENT_MESSAGE_PAGE_SORT).prefault({});
export type ReadMySentMessagesInput = z.infer<typeof readMySentMessagesInputSchema>;
