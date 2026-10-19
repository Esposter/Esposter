import type { Inventory } from "#src/models/inventory/Inventory";
import type { MaterialData } from "#src/models/inventory/MaterialData";
import type { Wallet } from "#src/models/inventory/Wallet";
import type { Mail } from "#src/models/mail/Mail";
import type { MailboxState } from "#src/models/mail/MailboxState";
import type { MailSave } from "#src/models/mail/MailSave";

import { addRewardItem } from "#src/services/inventory/addRewardItem";
import { checkIsSameHeldMail } from "#src/services/mail/checkIsSameHeldMail";

// The items of one held mail into the bag and the wallet, and that delivery of it marked claimed and read. Undefined
// When that delivery is already claimed or not held, or when the bag cannot take all its items whole, so a claim gives
// Its items once or not at all
export const claimMail = (
  state: MailboxState,
  held: MailSave,
  mailRow: Mail,
  names: Readonly<Record<string, string>>,
  materialDataMap: ReadonlyMap<number, MaterialData>,
): MailboxState | undefined => {
  const heldMail = state.mails.find((mail) => checkIsSameHeldMail(mail, held));
  if (heldMail === undefined || heldMail.isClaimed) return undefined;
  let granted: { inventory: Inventory; wallet: Wallet } = state;
  for (const { itemId, quantity } of mailRow.items) {
    const addition = addRewardItem(granted, { count: quantity, id: itemId }, names, materialDataMap);
    if (addition === undefined) return undefined;
    granted = addition;
  }
  return {
    inventory: granted.inventory,
    mails: state.mails.map((mail) =>
      checkIsSameHeldMail(mail, held) ? { ...mail, isClaimed: true, isRead: true } : mail,
    ),
    wallet: granted.wallet,
  };
};
