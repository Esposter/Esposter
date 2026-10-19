import { getResult } from "@esposter/shared";

// Whether the value names a real calendar date and time: Temporal refuses an impossible one, where Date rolls it over
// Into a later one, and a date-only value is midnight
export const checkIsRealEndsAt = (endsAt: string): boolean =>
  getResult(() => Temporal.PlainDateTime.from(endsAt)).match(
    () => true,
    () => false,
  );
