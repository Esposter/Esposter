import { callSessionIdInputSchema } from "#shared/models/db/call/CallSessionIdInput";
import { z } from "zod";

export const callSessionInputSchema = z.object({ id: callSessionIdInputSchema });
export type CallSessionInput = z.infer<typeof callSessionInputSchema>;
