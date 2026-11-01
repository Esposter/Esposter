import type { Mail } from "#src/models/mail/Mail";
import type { MailSave } from "#src/models/mail/MailSave";

// A held mail with its row, the pair the Mail screen lists and shows, the row holding the mail's text ids, items and expiry
export interface MailEntry {
  mail: MailSave;
  row: Mail;
}
