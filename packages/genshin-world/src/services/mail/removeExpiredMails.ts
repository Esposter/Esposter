import type { Mail } from "#src/models/mail/Mail";
import type { MailSave } from "#src/models/mail/MailSave";

const HOURS_PER_DAY = 24;

// The held mails still within their expiry, a mail past it deleted from the mailbox, except a birthday mail already
// Claimed, which the Gift Mail Box keeps. A mail with no row in the table is kept, since its expiry is unread
export const removeExpiredMails = (
  mails: readonly MailSave[],
  mailRows: ReadonlyMap<number, Mail>,
  birthdayMailIds: ReadonlySet<number>,
  now: Temporal.Instant,
): MailSave[] =>
  mails.filter((mail) => {
    const row = mailRows.get(mail.id);
    if (row === undefined) return true;
    const isGiftBoxed = mail.isClaimed && birthdayMailIds.has(mail.id);
    const expiresAt = Temporal.Instant.from(mail.deliveredAt).add({ hours: row.expireDays * HOURS_PER_DAY });
    return isGiftBoxed || Temporal.Instant.compare(expiresAt, now) > 0;
  });
