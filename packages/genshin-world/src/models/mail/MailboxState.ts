import type { Inventory } from "#src/models/inventory/Inventory";
import type { Wallet } from "#src/models/inventory/Wallet";
import type { MailSave } from "#src/models/mail/MailSave";

// The bag, the wallet and the held mails together, since a claim changes all three at once
export interface MailboxState {
  inventory: Inventory;
  mails: MailSave[];
  wallet: Wallet;
}
