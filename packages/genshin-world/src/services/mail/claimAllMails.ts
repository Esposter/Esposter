import type { MaterialData } from "#src/models/inventory/MaterialData";
import type { Mail } from "#src/models/mail/Mail";
import type { MailboxState } from "#src/models/mail/MailboxState";

import { claimMail } from "#src/services/mail/claimMail";

// Every held mail claimed in the order the mailbox holds them, each taking its items only when the bag and the wallet
// Take them whole, so a mail the bag cannot fit stays unclaimed and the rest still claim
export const claimAllMails = (
  state: MailboxState,
  mailRows: ReadonlyMap<number, Mail>,
  names: Readonly<Record<string, string>>,
  materialDataMap: ReadonlyMap<number, MaterialData>,
): MailboxState =>
  state.mails.reduce<MailboxState>((current, { id }) => {
    const mailRow = mailRows.get(id);
    if (mailRow === undefined) return current;
    return claimMail(current, mailRow, names, materialDataMap) ?? current;
  }, state);
