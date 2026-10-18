import type { Mail } from "#src/models/mail/Mail";
import type { MailSave } from "#src/models/mail/MailSave";

import { sortMails } from "#src/services/mail/sortMails";
import { describe, expect, test } from "vitest";

const row = (id: number, isStar: boolean): [number, Mail] => [
  id,
  { contentTextId: "1", expireDays: 365, id, isStar, items: [], senderTextId: "2", titleTextId: "3" },
];
const rows = new Map([row(1, true), row(2, false), row(3, false)]);
const mail = (id: number, deliveredAt: number): MailSave => ({
  deliveredAt: new Date(deliveredAt).toISOString(),
  id,
  isClaimed: false,
  isRead: false,
});

describe(sortMails, () => {
  // Pinned mail is listed above the rest, and the rest newest first
  test("pinned mail is listed first and the rest newest first", () => {
    expect.hasAssertions();

    expect(sortMails([mail(2, 0), mail(3, 1000), mail(1, 0)], rows).map(({ id }) => id)).toStrictEqual([1, 3, 2]);
  });
});
