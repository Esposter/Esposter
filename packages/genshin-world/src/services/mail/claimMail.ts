import type { Inventory } from "#src/models/inventory/Inventory";
import type { MaterialData } from "#src/models/inventory/MaterialData";
import type { Wallet } from "#src/models/inventory/Wallet";
import type { Mail } from "#src/models/mail/Mail";
import type { MailboxState } from "#src/models/mail/MailboxState";

import { addRewardItem } from "#src/services/inventory/addRewardItem";

// The held mail's items into the bag and the wallet, and the mail marked claimed and read. Undefined when the mail is
// Already claimed or not held, or when the bag cannot take all its items whole, so a claim gives its items once or not at all
export const claimMail = (
  state: MailboxState,
  mailRow: Mail,
  names: Readonly<Record<string, string>>,
  materialDataMap: ReadonlyMap<number, MaterialData>,
): MailboxState | undefined => {
  const held = state.mails.find(({ id }) => id === mailRow.id);
  if (held === undefined || held.isClaimed) return undefined;
  let granted: { inventory: Inventory; wallet: Wallet } = state;
  for (const { itemId, quantity } of mailRow.items) {
    const addition = addRewardItem(granted, { count: quantity, id: itemId }, names, materialDataMap);
    if (addition === undefined) return undefined;
    granted = addition;
  }
  return {
    inventory: granted.inventory,
    mails: state.mails.map((mail) => (mail.id === mailRow.id ? { ...mail, isClaimed: true, isRead: true } : mail)),
    wallet: granted.wallet,
  };
};
