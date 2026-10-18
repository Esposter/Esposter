import type { Mail } from "#src/models/mail/Mail";
import type { MailSave } from "#src/models/mail/MailSave";

// The held mails left by Delete Read, which takes every read mail whose attachments are claimed or absent, except a
// Pinned mail, since the game does not delete pinned mail quickly. A mail with no row is kept, since its contents are unread
export const deleteReadMails = (mails: readonly MailSave[], mailRows: ReadonlyMap<number, Mail>): MailSave[] =>
  mails.filter((mail) => {
    const row = mailRows.get(mail.id);
    if (row === undefined) return true;
    return !mail.isRead || row.isStar || (row.items.length > 0 && !mail.isClaimed);
  });
