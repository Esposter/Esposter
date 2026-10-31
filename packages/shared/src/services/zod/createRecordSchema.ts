import { z } from "zod";

// A record has no ceiling of its own, so the entry count is the schema's. It is carried as the JSON Schema's own
// `maxProperties` too, which is where a bounds check over a request's schema reads it
export const createRecordSchema = <TKey extends z.core.$ZodRecordKey, TValue extends z.core.SomeType>(
  keySchema: TKey,
  valueSchema: TValue,
  maxEntries: number,
): z.ZodRecord<TKey, TValue> =>
  z
    .record(keySchema, valueSchema)
    .refine((record) => Object.keys(record).length <= maxEntries, {
      error: `Record must have at most ${maxEntries} entries`,
    })
    .meta({ maxProperties: maxEntries });
