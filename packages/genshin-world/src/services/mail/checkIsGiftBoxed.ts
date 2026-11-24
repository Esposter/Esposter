import type { Mail } from "#src/models/mail/Mail";
import type { MailSave } from "#src/models/mail/MailSave";

// Whether a held mail is in the Gift Mail Box, which keeps it from expiry and from Delete Read: an important mail once
// Its rewards are claimed, which the game moves there on its own. The important mail is the birthday mail, and the mail
// The table flags, since its flag marks the box's mail (the wiki's Mail page and the game's own Gift Mail Box guide)
export const checkIsGiftBoxed = (mail: MailSave, row: Mail, birthdayMailIds: ReadonlySet<number>): boolean =>
  mail.isClaimed && (row.isStar || birthdayMailIds.has(mail.id));
