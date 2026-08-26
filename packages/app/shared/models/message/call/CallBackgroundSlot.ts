import { MAX_CALL_BACKGROUNDS } from "#shared/services/message/constants";
import { z } from "zod";

// The slot is the whole address a client may name — the user prefix comes from the session, so this can only
// Ever reach one of the caller's own blobs however it is forged. The cap is this range rather than a count of
// What exists: there are only MAX_CALL_BACKGROUNDS names, so no listing has to agree for the bound to hold
export const callBackgroundSlotSchema = z.object({
  slot: z
    .int()
    .min(0)
    .max(MAX_CALL_BACKGROUNDS - 1),
});
