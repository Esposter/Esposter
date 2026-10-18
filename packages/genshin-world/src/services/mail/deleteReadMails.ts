import type { Mail } from "#src/models/mail/Mail";
import type { MailSave } from "#src/models/mail/MailSave";

import { isGiftBoxed } from "#src/services/mail/isGiftBoxed";

// The held mails left by Delete Read, which takes every read mail whose attachments are claimed or absent, except a mail
// In the Gift Mail Box and a pinned mail, since the game does not delete either quickly (the wiki's Mail page) A mail with no row is kept, since
// Its contents are unread
export const deleteReadMails = (
  mails: readonly MailSave[],
  mailRows: ReadonlyMap<number, Mail>,
  birthdayMailIds: ReadonlySet<number>,
): MailSave[] =>
  mails.filter((mail) => {
    const row = mailRows.get(mail.id);
    if (row === undefined) return true;
    return (
      !mail.isRead || mail.isPinned || isGiftBoxed(mail, birthdayMailIds) || (row.items.length > 0 && !mail.isClaimed)
    );
  });
