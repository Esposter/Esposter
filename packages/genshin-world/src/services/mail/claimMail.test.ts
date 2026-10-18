import type { Mail } from "#src/models/mail/Mail";
import type { MailboxState } from "#src/models/mail/MailboxState";

import { Currency } from "#src/models/inventory/Currency";
import { CurrencyItemIdMap, EMPTY_INVENTORY, EMPTY_WALLET } from "#src/services/inventory/constants";
import { claimMail } from "#src/services/mail/claimMail";
import { describe, expect, test } from "vitest";

describe(claimMail, () => {
  const MORA_COUNT = 5;
  const ROW: Mail = {
    contentTextId: "1",
    expireDays: 365,
    id: 1,
    isStar: false,
    items: [{ itemId: CurrencyItemIdMap[Currency.Mora], quantity: MORA_COUNT }],
    senderTextId: "2",
    titleTextId: "3",
  };
  const STATE: MailboxState = {
    inventory: EMPTY_INVENTORY,
    mails: [{ deliveredAt: new Date(0).toISOString(), id: ROW.id, isClaimed: false, isRead: false }],
    wallet: EMPTY_WALLET,
  };
  const NAMES = {};
  const MATERIAL_DATA_MAP = new Map();

  // A held mail's items reach the wallet once, and the mail is marked claimed and read
  test("claiming a mail gives its items once", () => {
    expect.hasAssertions();

    expect(claimMail(STATE, ROW, NAMES, MATERIAL_DATA_MAP)).toStrictEqual({
      inventory: EMPTY_INVENTORY,
      mails: [{ deliveredAt: new Date(0).toISOString(), id: ROW.id, isClaimed: true, isRead: true }],
      wallet: { ...EMPTY_WALLET, [Currency.Mora]: MORA_COUNT },
    });
  });

  // A mail already claimed gives nothing when claimed again
  test("a claimed mail cannot be claimed again", () => {
    expect.hasAssertions();

    const claimed = claimMail(STATE, ROW, NAMES, MATERIAL_DATA_MAP);
    if (claimed === undefined) throw new Error("the mail was not claimed");

    expect(claimMail(claimed, ROW, NAMES, MATERIAL_DATA_MAP)).toBeUndefined();
  });
});
