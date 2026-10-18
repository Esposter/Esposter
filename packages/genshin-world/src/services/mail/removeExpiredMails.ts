import type { Mail } from "#src/models/mail/Mail";
import type { MailSave } from "#src/models/mail/MailSave";

import { getMailExpiresAt } from "#src/services/mail/getMailExpiresAt";
import { isGiftBoxed } from "#src/services/mail/isGiftBoxed";

// The held mails still within their expiry, a mail past it deleted from the mailbox, except a mail in the Gift Mail Box,
// Which keeps it. A mail with no row in the table is kept, since its expiry is unread
export const removeExpiredMails = (
  mails: readonly MailSave[],
  mailRows: ReadonlyMap<number, Mail>,
  birthdayMailIds: ReadonlySet<number>,
  now: Temporal.Instant,
): MailSave[] =>
  mails.filter((mail) => {
    const row = mailRows.get(mail.id);
    if (row === undefined) return true;
    const expiresAt = getMailExpiresAt(mail.deliveredAt, row.expireDays);
    return isGiftBoxed(mail, row, birthdayMailIds) || Temporal.Instant.compare(expiresAt, now) > 0;
  });
