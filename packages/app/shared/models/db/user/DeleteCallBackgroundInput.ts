import { MAX_CALL_BACKGROUNDS } from "#shared/services/message/constants";
import { z } from "zod";

export const deleteCallBackgroundInputSchema = z.object({
  // The slot is the whole address: the user prefix is taken from the session, so this can only ever name one
  // Of the caller's own blobs however it is forged
  slot: z
    .int()
    .min(0)
    .max(MAX_CALL_BACKGROUNDS - 1),
});
export type DeleteCallBackgroundInput = z.infer<typeof deleteCallBackgroundInputSchema>;
