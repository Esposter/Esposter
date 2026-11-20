import { selectCallSessionInMessageSchema } from "@esposter/db-schema";
import { z } from "zod";

export const callSessionInputSchema = z.object({ id: selectCallSessionInMessageSchema.shape.id });
export type CallSessionInput = z.infer<typeof callSessionInputSchema>;
