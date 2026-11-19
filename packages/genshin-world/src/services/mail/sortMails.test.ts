import type { MailSave } from "#src/models/mail/MailSave";

import { sortMails } from "#src/services/mail/sortMails";
import { describe, expect, test } from "vitest";

const mail = (id: number, deliveredAt: number, isPinned = false): MailSave => ({
  deliveredAt: new Date(deliveredAt).toISOString(),
  id,
  isClaimed: false,
  isPinned,
  isRead: false,
});

describe(sortMails, () => {
  // Pinned mail is listed above the rest, and the rest newest first
  test("pinned mail is listed first and the rest newest first", () => {
    expect.hasAssertions();

    expect(sortMails([mail(2, 0), mail(3, 1000), mail(1, 0, true)]).map(({ id }) => id)).toStrictEqual([1, 3, 2]);
  });

  test("deleting a pin returns the mail to its place by delivery", () => {
    expect.hasAssertions();

    // The mail that was pinned, delivered oldest, is unpinned and takes its place between the other two by delivery
    expect(sortMails([mail(1, 2000), mail(2, 3000), mail(3, 1000)]).map(({ id }) => id)).toStrictEqual([2, 1, 3]);
  });
});
