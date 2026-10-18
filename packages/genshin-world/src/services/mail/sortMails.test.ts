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
});
