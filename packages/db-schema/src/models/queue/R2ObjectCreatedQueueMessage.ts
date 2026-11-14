import { z } from "zod";

// The body of R2's object-create event notification, which R2 sends to a queue as it stores an object. Only the fields a
// consumer reads are stated; R2 also sends `account`, `action` and the object's `eTag`, which nothing here needs.
// `bucket` names the bucket the object landed in, and `object.key` is its name as stored, so no decoding is needed.
// `eventTime` is when R2 stored the object. R2 gives no per-object ordering token, so two writes to one key are ordered
// by it, at the millisecond it carries.
export interface R2ObjectCreatedQueueMessage {
  bucket: string;
  eventTime: string;
  object: { key: string; size: number };
}

export const r2ObjectCreatedQueueMessageSchema = z.object({
  bucket: z.string(),
  eventTime: z.string(),
  object: z.object({
    key: z.string(),
    size: z.int().nonnegative(),
  }),
}) satisfies z.ZodType<R2ObjectCreatedQueueMessage>;
