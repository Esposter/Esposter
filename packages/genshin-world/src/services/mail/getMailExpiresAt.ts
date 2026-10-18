import { HOURS_PER_DAY } from "#src/services/mail/constants";

// The instant a mail expires at: `expireDays` after the instant it was delivered at
export const getMailExpiresAt = (deliveredAt: string, expireDays: number): Temporal.Instant =>
  Temporal.Instant.from(deliveredAt).add({ hours: expireDays * HOURS_PER_DAY });
