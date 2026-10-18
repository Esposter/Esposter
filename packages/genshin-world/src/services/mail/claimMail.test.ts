import type { Mail } from "#src/models/mail/Mail";
import type { MailboxState } from "#src/models/mail/MailboxState";
import type { MailSave } from "#src/models/mail/MailSave";

import { Currency } from "#src/models/inventory/Currency";
import { CurrencyItemIdMap, EMPTY_INVENTORY, EMPTY_WALLET } from "#src/services/inventory/constants";
import { claimMail } from "#src/services/mail/claimMail";
import { assert, describe, expect, test } from "vitest";

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
  const HELD: MailSave = {
    deliveredAt: new Date(0).toISOString(),
    id: ROW.id,
    isClaimed: false,
    isPinned: false,
    isRead: false,
  };
  const STATE: MailboxState = { inventory: EMPTY_INVENTORY, mails: [HELD], wallet: EMPTY_WALLET };
  const NAMES = {};
  const MATERIAL_DATA_MAP = new Map();

  // A held mail's items reach the wallet once, and the mail is marked claimed and read
  test("claiming a mail gives its items once", () => {
    expect.hasAssertions();

    expect(claimMail(STATE, HELD, ROW, NAMES, MATERIAL_DATA_MAP)).toStrictEqual({
      inventory: EMPTY_INVENTORY,
      mails: [{ ...HELD, isClaimed: true, isRead: true }],
      wallet: { ...EMPTY_WALLET, [Currency.Mora]: MORA_COUNT },
    });
  });

  // A mail already claimed gives nothing when claimed again
  test("a claimed mail cannot be claimed again", () => {
    expect.hasAssertions();

    const claimed = claimMail(STATE, HELD, ROW, NAMES, MATERIAL_DATA_MAP);
    assert.exists(claimed);

    expect(claimMail(claimed, HELD, ROW, NAMES, MATERIAL_DATA_MAP)).toBeUndefined();
  });

  // A mail held once per delivery: claiming one delivery leaves the other delivery of the same mail as it was
  test("claiming one delivery of a mail leaves its other delivery as it was", () => {
    expect.hasAssertions();

    const LATER: MailSave = { ...HELD, deliveredAt: new Date(1).toISOString() };

    expect(claimMail({ ...STATE, mails: [HELD, LATER] }, HELD, ROW, NAMES, MATERIAL_DATA_MAP)).toStrictEqual({
      inventory: EMPTY_INVENTORY,
      mails: [{ ...HELD, isClaimed: true, isRead: true }, LATER],
      wallet: { ...EMPTY_WALLET, [Currency.Mora]: MORA_COUNT },
    });
  });
});
