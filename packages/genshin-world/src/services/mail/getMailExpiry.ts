import type { MailExpiry } from "#src/models/mail/MailExpiry";

import { MailExpiryUnit } from "#src/models/mail/MailExpiryUnit";
import { HOURS_PER_DAY } from "#src/services/mail/constants";
import { getMailExpiresAt } from "#src/services/mail/getMailExpiresAt";

const MS_PER_MINUTE = 60_000;
const MS_PER_HOUR = 60 * MS_PER_MINUTE;
const MS_PER_DAY = HOURS_PER_DAY * MS_PER_HOUR;

// How long a mail has before it expires, in the largest unit it still fills: days, then hours, then minutes, and under a
// Minute once it is nearly gone. A mail delivered at its instant expires `expireDays` later
export const getMailExpiry = (deliveredAt: string, expireDays: number, now: Temporal.Instant): MailExpiry => {
  const remainingMs = getMailExpiresAt(deliveredAt, expireDays).epochMilliseconds - now.epochMilliseconds;
  if (remainingMs >= MS_PER_DAY) return { count: Math.floor(remainingMs / MS_PER_DAY), unit: MailExpiryUnit.Day };
  if (remainingMs >= MS_PER_HOUR) return { count: Math.floor(remainingMs / MS_PER_HOUR), unit: MailExpiryUnit.Hour };
  if (remainingMs >= MS_PER_MINUTE)
    return { count: Math.floor(remainingMs / MS_PER_MINUTE), unit: MailExpiryUnit.Minute };
  return { count: 0, unit: MailExpiryUnit.LessThanMinute };
};
