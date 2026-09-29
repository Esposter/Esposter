import { selectCallSessionInMessageSchema } from "#src/schema/message/callSessionsInMessage";
import { z } from "zod";

export const callSessionIdSchema = z.object({ callSessionId: selectCallSessionInMessageSchema.shape.id });
