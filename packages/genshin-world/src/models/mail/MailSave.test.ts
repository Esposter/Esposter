import { mailSaveSchema } from "#src/models/mail/MailSave";
import { describe, expect, test } from "vitest";

describe("mailSaveSchema", () => {
  const DELIVERED_AT = new Date(0).toISOString();

  // A mail claimed before a save is reloaded, its claim read back from the saved text, so it is still claimed after
  test("a mail's claim is kept across a reload", () => {
    expect.hasAssertions();

    const mail = { deliveredAt: DELIVERED_AT, id: 1, isClaimed: true, isRead: true };

    expect(mailSaveSchema.parse(structuredClone(mail))).toStrictEqual(mail);
  });
});
