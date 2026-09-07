import { callBackgroundSlotSchema } from "#shared/models/message/call/CallBackgroundSlot";
import { fileEntitySchema } from "@esposter/db-schema";
import { z } from "zod";

export const generateCallBackgroundUploadUrlInputSchema = z.object({
  // The slot is sent rather than allocated server-side. A listing cannot allocate durably — a delete is
  // Reclaimed by a worker, so a slot freed a moment ago still reads as taken, and two concurrent requests read
  // The same free one — while the client already holds the view it is acting on. The blob naming is what
  // Bounds the count, so nothing is lost by trusting it: the worst a client can do is overwrite its own image
  ...callBackgroundSlotSchema.shape,
  // The mimetype is signed into the write SAS, and the size is the early no the SAS itself cannot enforce
  ...fileEntitySchema.pick({ mimetype: true, size: true }).shape,
});
export type GenerateCallBackgroundUploadUrlInput = z.infer<typeof generateCallBackgroundUploadUrlInputSchema>;
