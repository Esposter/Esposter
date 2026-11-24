import type { Mail } from "#src/models/mail/Mail";
import type { MailSave } from "#src/models/mail/MailSave";

import { checkIsClaimable } from "#src/services/mail/checkIsClaimable";
import { checkIsGiftBoxed } from "#src/services/mail/checkIsGiftBoxed";

// The held mails left by Delete Read, which takes every read mail whose attachments are claimed or absent, except a
// Mail in the Gift Mail Box and a pinned mail, since the game does not delete either quickly (the wiki's Mail page) A
// Mail with no row is kept, since its contents are unread
export const deleteReadMails = (
  mails: readonly MailSave[],
  mailRows: ReadonlyMap<number, Mail>,
  birthdayMailIds: ReadonlySet<number>,
): MailSave[] =>
  mails.filter((mail) => {
    const row = mailRows.get(mail.id);
    if (row === undefined) return true;
    return !mail.isRead || mail.isPinned || checkIsGiftBoxed(mail, row, birthdayMailIds) || checkIsClaimable(mail, row);
  });
