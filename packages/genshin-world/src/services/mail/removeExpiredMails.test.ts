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
  const rows = new Map<number, Mail>([[ROW.id, ROW]]);
  const mail = (isClaimed: boolean): MailSave => ({
    deliveredAt: new Date(0).toISOString(),
    id: ROW.id,
    isClaimed,
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

  // A mail the player starred moves to the Gift Mail Box, which keeps it past its expiry, as it keeps a birthday mail
  test("a starred mail is kept past its expiry", () => {
    expect.hasAssertions();

    const starred: MailSave = { ...mail(false), isStarred: true };

    expect(removeExpiredMails([starred], rows, new Set(), PAST_EXPIRY)).toStrictEqual([starred]);
  });
});
