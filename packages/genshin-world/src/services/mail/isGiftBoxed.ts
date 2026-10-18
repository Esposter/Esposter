import type { MailSave } from "#src/models/mail/MailSave";

// Whether a held mail is in the Gift Mail Box, which keeps it from expiry and from Delete Read: a mail the player starred,
// And a birthday mail once its rewards are claimed, which the game moves there on its own (the wiki's Mail page)
export const isGiftBoxed = (mail: MailSave, birthdayMailIds: ReadonlySet<number>): boolean =>
  mail.isStarred === true || (mail.isClaimed && birthdayMailIds.has(mail.id));
