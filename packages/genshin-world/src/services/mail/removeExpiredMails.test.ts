import type { Mail } from "#src/models/mail/Mail";
import type { MailSave } from "#src/models/mail/MailSave";

import { removeExpiredMails } from "#src/services/mail/removeExpiredMails";
import { describe, expect, test } from "vitest";

describe(removeExpiredMails, () => {
  const DAY_MS = 86_400_000;
  const EXPIRE_DAYS = 365;
  const ROW: Mail = {
    contentTextId: "1",
    expireDays: EXPIRE_DAYS,
    id: 1,
    isStar: false,
    items: [],
    senderTextId: "2",
    titleTextId: "3",
  };
  const FLAGGED_ROW: Mail = { ...ROW, id: 2, isStar: true };
  const rows = new Map<number, Mail>([ROW, FLAGGED_ROW].map((row): [number, Mail] => [row.id, row]));
  const mail = (isClaimed: boolean, id = ROW.id): MailSave => ({
    deliveredAt: new Date(0).toISOString(),
    id,
    isClaimed,
    isPinned: false,
    isRead: false,
  });
  const PAST_EXPIRY = Temporal.Instant.fromEpochMilliseconds(DAY_MS * (EXPIRE_DAYS + 1));
  const WITHIN_EXPIRY = Temporal.Instant.fromEpochMilliseconds(DAY_MS * (EXPIRE_DAYS - 1));

  // A mail held past its expiry is deleted from the mailbox
  test("a mail past its expiry is deleted", () => {
    expect.hasAssertions();

    expect(removeExpiredMails([mail(false)], rows, new Set(), PAST_EXPIRY)).toStrictEqual([]);
  });

  // A mail still within its expiry stays in the mailbox
  test("a mail within its expiry is kept", () => {
    expect.hasAssertions();

    expect(removeExpiredMails([mail(false)], rows, new Set(), WITHIN_EXPIRY)).toStrictEqual([mail(false)]);
  });

  // A birthday mail claimed moves to the Gift Mail Box, which keeps it past its expiry
  test("a claimed birthday mail is kept past its expiry", () => {
    expect.hasAssertions();

    expect(removeExpiredMails([mail(true)], rows, new Set([ROW.id]), PAST_EXPIRY)).toStrictEqual([mail(true)]);
  });

  // A claimed mail the table flags is in the Gift Mail Box, which keeps it past its expiry, as it keeps a birthday mail
  test("a claimed mail the table flags is kept past its expiry", () => {
    expect.hasAssertions();

    expect(removeExpiredMails([mail(true, FLAGGED_ROW.id)], rows, new Set(), PAST_EXPIRY)).toStrictEqual([
      mail(true, FLAGGED_ROW.id),
    ]);
  });

  // A mail the table flags is kept in the Gift Mail Box only once its rewards are claimed
  test("an unclaimed mail the table flags is deleted past its expiry", () => {
    expect.hasAssertions();

    expect(removeExpiredMails([mail(false, FLAGGED_ROW.id)], rows, new Set(), PAST_EXPIRY)).toStrictEqual([]);
  });

  // A pinned mail is the player's place at the top of the list, not the Gift Mail Box, so it still expires
  test("a pinned mail is deleted past its expiry", () => {
    expect.hasAssertions();

    expect(removeExpiredMails([{ ...mail(false), isPinned: true }], rows, new Set(), PAST_EXPIRY)).toStrictEqual([]);
  });
});
