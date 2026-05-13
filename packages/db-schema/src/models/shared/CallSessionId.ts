import { selectCallSessionInMessageSchema } from "@/schema/callSessionsInMessage";
import { z } from "zod";

export const callSessionIdSchema = z.object({
  callSessionId: selectCallSessionInMessageSchema.shape.id,
});
