import type { MaterialData } from "#src/models/inventory/MaterialData";
import type { Mail } from "#src/models/mail/Mail";
import type { MailSave } from "#src/models/mail/MailSave";

import { Currency } from "#src/models/inventory/Currency";
import { MaterialType } from "#src/models/inventory/MaterialType";
import { CurrencyItemIdMap } from "#src/services/inventory/constants";
import { useWorldMailStore } from "#src/store/mail";
import { startTestWorldSession } from "#src/store/session.fixture";
import { describe, expect, test } from "vitest";

const createHeld = (id: number): MailSave => ({
  deliveredAt: new Date(0).toISOString(),
  id,
  isClaimed: false,
  isPinned: false,
  isRead: false,
});

describe(useWorldMailStore, () => {
  const MORA_COUNT = 5;
  const MATERIAL_ID = 900_001;
  const MATERIAL: MaterialData = {
    id: MATERIAL_ID,
    materialType: MaterialType.Consume,
    nameTextId: "1",
    rank: 1,
    rarity: 1,
    stackLimit: 99,
  };
  const MORA_ROW: Mail = {
    contentTextId: "1",
    expireDays: 365,
    id: 1,
    isStar: false,
    items: [{ itemId: CurrencyItemIdMap[Currency.Mora], quantity: MORA_COUNT }],
    senderTextId: "2",
    titleTextId: "3",
  };
  const OVERFLOW_ROW: Mail = { ...MORA_ROW, id: 2, items: [{ itemId: MATERIAL_ID, quantity: 100_000 }] };
  const setUpMailbox = (row: Mail) => {
    const worldSessionStore = startTestWorldSession({
      materialDataMap: new Map([[MATERIAL_ID, MATERIAL]]),
      nameText: { "1": "Made-up Material" },
    });
    const worldMailStore = useWorldMailStore();
    const held = createHeld(row.id);
    worldMailStore.mails = [held];
    worldMailStore.mailData = { birthdayMailIds: new Set(), mailRows: new Map([[row.id, row]]), textMap: {} };
    return { held, worldMailStore, worldSessionStore };
  };

  test("a claim pays the mail's items into the session's wallet and marks the mail claimed", () => {
    expect.hasAssertions();

    const { held, worldMailStore, worldSessionStore } = setUpMailbox(MORA_ROW);
    worldMailStore.claim(held);

    expect({
      isBagFull: worldMailStore.isBagFull,
      mails: worldMailStore.mails,
      mora: worldSessionStore.wallet[Currency.Mora],
    }).toStrictEqual({ isBagFull: false, mails: [{ ...held, isClaimed: true, isRead: true }], mora: MORA_COUNT });
  });

  test("a claim the bag cannot hold whole leaves the mail held and says the bag is full", () => {
    expect.hasAssertions();

    const { held, worldMailStore } = setUpMailbox(OVERFLOW_ROW);
    worldMailStore.claim(held);

    expect({ isBagFull: worldMailStore.isBagFull, mails: worldMailStore.mails }).toStrictEqual({
      isBagFull: true,
      mails: [held],
    });
  });

  test("a mail pinned and read is held pinned and read", () => {
    expect.hasAssertions();

    const { held, worldMailStore } = setUpMailbox(MORA_ROW);
    worldMailStore.toggleMailPin(held);
    worldMailStore.markMailRead(held);

    expect(worldMailStore.mails).toStrictEqual([{ ...held, isPinned: true, isRead: true }]);
  });

  test("stopping the store empties the mailbox", () => {
    expect.hasAssertions();

    const { worldMailStore } = setUpMailbox(MORA_ROW);
    worldMailStore.stop();

    expect({ mailData: worldMailStore.mailData, mails: worldMailStore.mails }).toStrictEqual({
      mailData: undefined,
      mails: [],
    });
  });
});
