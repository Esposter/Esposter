import type { MailSave } from "#src/models/mail/MailSave";

// Whether a held mail is in the Gift Mail Box, which keeps it from expiry and from Delete Read: a birthday mail once its
// Rewards are claimed, which the game moves there on its own (the wiki's Mail page, and the game's own Gift Mail Box guide)
export const isGiftBoxed = (mail: MailSave, birthdayMailIds: ReadonlySet<number>): boolean =>
  mail.isClaimed && birthdayMailIds.has(mail.id);
