import type { Mail } from "#src/models/mail/Mail";
import type { MailSave } from "#src/models/mail/MailSave";

import { deleteGiftMail } from "#src/services/mail/deleteGiftMail";
import { describe, expect, test } from "vitest";

const mail = (id: number, isClaimed: boolean): MailSave => ({
  deliveredAt: new Date(0).toISOString(),
  id,
  isClaimed,
  isPinned: false,
  isRead: true,
});
const row = (id: number, isStar: boolean): Mail => ({
  contentTextId: "1",
  expireDays: 365,
  id,
  isStar,
  items: [],
  senderTextId: "2",
  titleTextId: "3",
});

describe(deleteGiftMail, () => {
  const BIRTHDAY_ROW = row(1, false);
  const FLAGGED_ROW = row(2, true);
  const mailRows = new Map<number, Mail>([
    [BIRTHDAY_ROW.id, BIRTHDAY_ROW],
    [FLAGGED_ROW.id, FLAGGED_ROW],
  ]);
  const birthdayMailIds = new Set([BIRTHDAY_ROW.id]);

  // A claimed birthday mail is in the Gift Mail Box, so its delete removes it and leaves the other mail where it is
  test("removes the gift mail it is asked to delete and keeps the rest", () => {
    expect.hasAssertions();

    expect(deleteGiftMail([mail(1, true), mail(2, false)], mailRows, birthdayMailIds, mail(1, true))).toStrictEqual([
      mail(2, false),
    ]);
  });

  // A held mail is one delivery of its mail, so a delete removes the delivery it names and keeps the other delivery
  test("removes only the delivery of the gift mail it is asked to delete", () => {
    expect.hasAssertions();

    const later = { ...mail(1, true), deliveredAt: new Date(1).toISOString() };

    expect(deleteGiftMail([mail(1, true), later], mailRows, birthdayMailIds, later)).toStrictEqual([mail(1, true)]);
  });

  // A claimed mail the table flags is in the Gift Mail Box as well, so its delete removes it
  test("removes a claimed mail the table flags", () => {
    expect.hasAssertions();

    expect(deleteGiftMail([mail(2, true)], mailRows, new Set(), mail(2, true))).toStrictEqual([]);
  });

  // A birthday mail not yet claimed is outside the Gift Mail Box, so the delete leaves it
  test("keeps a mail outside the Gift Mail Box", () => {
    expect.hasAssertions();

    expect(deleteGiftMail([mail(1, false)], mailRows, birthdayMailIds, mail(1, false))).toStrictEqual([mail(1, false)]);
  });
});
