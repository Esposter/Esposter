import type { Mail } from "#src/models/mail/Mail";
import type { MailSave } from "#src/models/mail/MailSave";

// Whether a held mail has items it has not paid out yet, which the list marks as the game's red mark does
export const checkIsClaimable = (mail: MailSave, row: Mail): boolean => !mail.isClaimed && row.items.length > 0;
