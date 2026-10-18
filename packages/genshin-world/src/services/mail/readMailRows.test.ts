import type { Mail } from "#src/models/mail/Mail";
import type { MailSave } from "#src/models/mail/MailSave";

import { readMailRows } from "#src/services/mail/readMailRows";
import { removeExpiredMails } from "#src/services/mail/removeExpiredMails";
import { afterEach, describe, expect, test, vi } from "vitest";

const { INDEX_HASH, ROW_HASH } = vi.hoisted(() => ({ INDEX_HASH: "1".repeat(64), ROW_HASH: "2".repeat(64) }));

// The committed lock names no mail index until the mail table is published, so the test names one with made-up hashes
vi.mock(import("#src/services/data/gameDataLock"), async (importOriginal) => {
  const { gameDataLock } = await importOriginal();
  return { gameDataLock: { ...gameDataLock, indexes: { ...gameDataLock.indexes, "mail/mail": INDEX_HASH } } };
});

describe(readMailRows, () => {
  const gameDataBaseUrl = "mail-rows";
  const DAY_MS = 86_400_000;
  const ROW: Mail = {
    contentTextId: "1",
    expireDays: 1,
    id: 1,
    isStar: false,
    items: [],
    senderTextId: "2",
    titleTextId: "3",
  };
  const GONE_ID = 2;

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // A held mail whose row the table no longer names is left out of the rows without failing the others, and the save
  // Keeps it: removeExpiredMails keeps a mail with no row, since its expiry is unread
  test("a held mail whose row is gone is left off the list and kept in the save", async () => {
    expect.hasAssertions();

    // The index is read first, then the one row the index names
    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(Response.json({ [String(ROW.id)]: ROW_HASH }))
      .mockResolvedValueOnce(Response.json(ROW));
    const held: MailSave[] = [
      { deliveredAt: new Date(0).toISOString(), id: ROW.id, isClaimed: false, isPinned: false, isRead: false },
      { deliveredAt: new Date(0).toISOString(), id: GONE_ID, isClaimed: false, isPinned: false, isRead: false },
    ];
    const rows = await readMailRows(gameDataBaseUrl, [ROW.id, GONE_ID]);
    const PAST_ROW_EXPIRY = Temporal.Instant.fromEpochMilliseconds(DAY_MS * (ROW.expireDays + 1));

    expect(rows).toStrictEqual(new Map([[ROW.id, ROW]]));
    expect(removeExpiredMails(held, rows, new Set(), PAST_ROW_EXPIRY)).toStrictEqual([held[1]]);
  });
});
