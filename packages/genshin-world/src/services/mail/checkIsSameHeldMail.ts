import type { MailSave } from "#src/models/mail/MailSave";

// Whether a held mail is the one another names: a mail is held once per delivery, so its id alone names every
// Delivery of it, and the instant it was delivered tells them apart
export const checkIsSameHeldMail = (mail: MailSave, held: MailSave): boolean =>
  mail.id === held.id && mail.deliveredAt === held.deliveredAt;
