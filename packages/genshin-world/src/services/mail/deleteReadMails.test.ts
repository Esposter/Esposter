import type { Mail } from "#src/models/mail/Mail";
import type { MailSave } from "#src/models/mail/MailSave";

import { deleteReadMails } from "#src/services/mail/deleteReadMails";
import { describe, expect, test } from "vitest";

const mail = (id: number, isClaimed: boolean, isRead: boolean): MailSave => ({
  deliveredAt: new Date(0).toISOString(),
  id,
  isClaimed,
  isPinned: false,
  isRead,
});

describe(deleteReadMails, () => {
  const ROW: Mail = {
    contentTextId: "1",
    expireDays: 365,
    id: 1,
    isStar: false,
    items: [{ itemId: 2, quantity: 1 }],
    senderTextId: "3",
    titleTextId: "4",
  };
  const EMPTY_ROW: Mail = { ...ROW, id: 3, items: [] };
  const rows = new Map<number, Mail>([ROW, EMPTY_ROW].map((row): [number, Mail] => [row.id, row]));

  // A read mail with no attachment is deleted, since there is nothing left in it to claim
  test("a read mail with no attachment is deleted", () => {
    expect.hasAssertions();

    expect(deleteReadMails([mail(EMPTY_ROW.id, false, true)], rows, new Set())).toStrictEqual([]);
  });

  // A read mail whose attachment is claimed is deleted, since its items are already in the bag
  test("a read mail whose attachment is claimed is deleted", () => {
    expect.hasAssertions();

    expect(deleteReadMails([mail(ROW.id, true, true)], rows, new Set())).toStrictEqual([]);
  });

  // A read mail still holding an unclaimed attachment is kept, so Delete Read never takes a reward unclaimed
  test("a read mail with an unclaimed attachment is kept", () => {
    expect.hasAssertions();

    expect(deleteReadMails([mail(ROW.id, false, true)], rows, new Set())).toStrictEqual([mail(ROW.id, false, true)]);
  });

  // An unread mail is kept, since Delete Read takes only the mails already read
  test("an unread mail is kept", () => {
    expect.hasAssertions();

    expect(deleteReadMails([mail(EMPTY_ROW.id, false, false)], rows, new Set())).toStrictEqual([
      mail(EMPTY_ROW.id, false, false),
    ]);
  });

  // A pinned mail is kept, since the game does not delete pinned mail quickly
  test("a read pinned mail is kept", () => {
    expect.hasAssertions();

    const pinned: MailSave = { ...mail(EMPTY_ROW.id, false, true), isPinned: true };

    expect(deleteReadMails([pinned], rows, new Set())).toStrictEqual([pinned]);
  });

  // A mail with no row is kept, since what it holds cannot be read to tell it is spent
  test("a read mail with no row is kept", () => {
    expect.hasAssertions();

    expect(deleteReadMails([mail(9, true, true)], rows, new Set())).toStrictEqual([mail(9, true, true)]);
  });

  // A birthday mail claimed is in the Gift Mail Box, which Delete Read leaves alone
  test("a read claimed birthday mail is kept", () => {
    expect.hasAssertions();

    expect(deleteReadMails([mail(ROW.id, true, true)], rows, new Set([ROW.id]))).toStrictEqual([
      mail(ROW.id, true, true),
    ]);
  });
});
