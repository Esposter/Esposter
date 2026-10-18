import type { Mail } from "#src/models/mail/Mail";
import type { MailboxState } from "#src/models/mail/MailboxState";

import { Currency } from "#src/models/inventory/Currency";
import { CurrencyItemIdMap, EMPTY_INVENTORY, EMPTY_WALLET } from "#src/services/inventory/constants";
import { claimAllMails } from "#src/services/mail/claimAllMails";
import { describe, expect, test } from "vitest";

describe(claimAllMails, () => {
  const MORA_COUNT = 5;
  const deliveredAt = new Date(0).toISOString();
  const row = (id: number): Mail => ({
    contentTextId: "1",
    expireDays: 365,
    id,
    isStar: false,
    items: [{ itemId: CurrencyItemIdMap[Currency.Mora], quantity: MORA_COUNT }],
    senderTextId: "2",
    titleTextId: "3",
  });
  const mailRows = new Map([row(1), row(2), row(3)].map((mail) => [mail.id, mail]));
  const STATE: MailboxState = {
    inventory: EMPTY_INVENTORY,
    mails: [
      { deliveredAt, id: 1, isClaimed: false },
      { deliveredAt, id: 2, isClaimed: false },
      { deliveredAt, id: 3, isClaimed: true },
    ],
    wallet: EMPTY_WALLET,
  };

  // Every unclaimed mail gives its items once, and a mail already claimed gives nothing again
  test("claim all gives every unclaimed mail its items once", () => {
    expect.hasAssertions();

    expect(claimAllMails(STATE, mailRows, {}, new Map())).toStrictEqual({
      inventory: EMPTY_INVENTORY,
      mails: [
        { deliveredAt, id: 1, isClaimed: true },
        { deliveredAt, id: 2, isClaimed: true },
        { deliveredAt, id: 3, isClaimed: true },
      ],
      wallet: { ...EMPTY_WALLET, [Currency.Mora]: MORA_COUNT * 2 },
    });
  });
});
