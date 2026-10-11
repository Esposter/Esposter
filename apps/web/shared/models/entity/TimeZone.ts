import { TIME_ZONE_MAX_LENGTH } from "#shared/services/intl/constants";
import { getResult } from "@esposter/shared";
import { z } from "zod";

export interface TimeZone {
  timeZone: string;
}

// A reader's IANA time zone, as their own clock gives it. It is resolved as Temporal resolves it, so any id a zoned
// Read accepts passes and none it rejects does
export const timeZoneSchema = z.object({
  timeZone: z
    .string()
    .max(TIME_ZONE_MAX_LENGTH)
    .refine(
      (timeZone) =>
        getResult(() => Temporal.Now.plainDateISO(timeZone)).match(
          () => true,
          () => false,
        ),
      { error: "Expected an IANA time zone" },
    ),
}) satisfies z.ZodType<TimeZone>;
