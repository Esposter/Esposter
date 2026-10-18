import type { MailExpiryUnit } from "#src/models/mail/MailExpiryUnit";

// How long a mail has before it expires, as a count of its unit
export interface MailExpiry {
  count: number;
  unit: MailExpiryUnit;
}
