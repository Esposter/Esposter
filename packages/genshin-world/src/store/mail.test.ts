import type { MaterialData } from "#src/models/inventory/MaterialData";
import type { Mail } from "#src/models/mail/Mail";
import type { MailSave } from "#src/models/mail/MailSave";
import type { readBirthdayMailRows } from "#src/services/mail/readBirthdayMailRows";
import type { readMailRows } from "#src/services/mail/readMailRows";
import type { readMailText } from "#src/services/mail/readMailText";

import { Currency } from "#src/models/inventory/Currency";
import { MaterialType } from "#src/models/inventory/MaterialType";
import { CurrencyItemIdMap } from "#src/services/inventory/constants";
import { useWorldMailStore } from "#src/store/mail";
import { startTestWorldSession } from "#src/store/session.fixture";
import { noop } from "@esposter/shared";
import { describe, expect, test, vi } from "vitest";

type BirthdayMailRows = Awaited<ReturnType<typeof readBirthdayMailRows>>;

const { readBirthdayMailRowsMock, readMailRowsMock, readMailTextMock } = vi.hoisted(() => ({
  readBirthdayMailRowsMock: vi.fn<typeof readBirthdayMailRows>(),
  readMailRowsMock: vi.fn<typeof readMailRows>(),
  readMailTextMock: vi.fn<typeof readMailText>(),
}));

vi.mock(import("#src/services/mail/readBirthdayMailRows"), () => ({ readBirthdayMailRows: readBirthdayMailRowsMock }));
vi.mock(import("#src/services/mail/readMailRows"), () => ({ readMailRows: readMailRowsMock }));
vi.mock(import("#src/services/mail/readMailText"), () => ({ readMailText: readMailTextMock }));

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

  test("a load still in flight when the session stops ends quietly rather than reading the stopped session", async () => {
    expect.hasAssertions();

    const consoleError = vi.spyOn(console, "error").mockImplementation(noop);
    let deliverBirthdayMailRows: (rows: BirthdayMailRows) => void = noop;
    readBirthdayMailRowsMock.mockReturnValueOnce(
      new Promise<BirthdayMailRows>((resolve) => {
        deliverBirthdayMailRows = resolve;
      }),
    );
    readMailRowsMock.mockResolvedValueOnce(new Map());
    readMailTextMock.mockResolvedValueOnce({});
    const worldSessionStore = startTestWorldSession();
    const worldMailStore = useWorldMailStore();
    worldMailStore.start([], undefined);
    // The Session page stops the session before the mailbox, as it unmounts
    worldSessionStore.stop();
    worldMailStore.stop();
    deliverBirthdayMailRows([]);
    await new Promise((resolve) => {
      setTimeout(resolve, 0);
    });

    const { calls } = consoleError.mock;
    consoleError.mockRestore();
    expect({ errors: calls, mailData: worldMailStore.mailData, mails: worldMailStore.mails }).toStrictEqual({
      errors: [],
      mailData: undefined,
      mails: [],
    });
  });

  test("a read that fails after the session stops is dropped without a log", async () => {
    expect.hasAssertions();

    const consoleError = vi.spyOn(console, "error").mockImplementation(noop);
    let failBirthdayMailRows: (error: Error) => void = noop;
    readBirthdayMailRowsMock.mockReturnValueOnce(
      new Promise<BirthdayMailRows>((_resolve, reject) => {
        failBirthdayMailRows = reject;
      }),
    );
    readMailRowsMock.mockResolvedValueOnce(new Map());
    readMailTextMock.mockResolvedValueOnce({});
    const worldSessionStore = startTestWorldSession();
    const worldMailStore = useWorldMailStore();
    worldMailStore.start([], undefined);
    worldSessionStore.stop();
    worldMailStore.stop();
    failBirthdayMailRows(new Error("birthday mail read failed"));
    await new Promise((resolve) => {
      setTimeout(resolve, 0);
    });

    const { calls } = consoleError.mock;
    consoleError.mockRestore();
    expect(calls).toStrictEqual([]);
  });
});
