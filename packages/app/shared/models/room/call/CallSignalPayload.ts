import { CallSignalType, callSignalTypeSchema } from "#shared/models/room/call/CallSignalType";
import { z } from "zod";

export interface CallSignalPayload {
  data: string;
  targetId: string;
  type: CallSignalType;
}

export const callSignalPayloadSchema = z.object({
  data: z.string(),
  targetId: z.string(),
  type: callSignalTypeSchema,
}) satisfies z.ZodType<CallSignalPayload>;
