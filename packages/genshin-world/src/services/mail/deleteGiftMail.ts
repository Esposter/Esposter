import type { Mail } from "#src/models/mail/Mail";
import type { MailSave } from "#src/models/mail/MailSave";

import { isGiftBoxed } from "#src/services/mail/isGiftBoxed";
import { isSameHeldMail } from "#src/services/mail/isSameHeldMail";

// The held mails left by the player's delete of one Gift Mail Box mail, which the game asks about first (the wiki's Mail page).
// Only that delivery of the mail goes, and only from the box; a mail with no row is kept, since its contents are unread
export const deleteGiftMail = (
  mails: readonly MailSave[],
  mailRows: ReadonlyMap<number, Mail>,
  birthdayMailIds: ReadonlySet<number>,
  held: MailSave,
): MailSave[] =>
  mails.filter((mail) => {
    if (!isSameHeldMail(mail, held)) return true;
    const row = mailRows.get(mail.id);
    return row === undefined || !isGiftBoxed(mail, row, birthdayMailIds);
  });
