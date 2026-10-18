import { birthdayMailRowsSchema, mailDataSchema } from "#src/models/mail/MailData";
import { describe, expect, test } from "vitest";

describe("mailDataSchema", () => {
  const MAIL = {
    contentTextId: "1",
    expireDays: 1,
    id: 1,
    isStar: false,
    items: [],
    senderTextId: "1",
    titleTextId: "1",
  };

  // A text id names the game's own words, so an empty one names nothing and the mail is refused
  test("refuses a mail whose content, sender or title text id is empty", () => {
    expect.hasAssertions();

    expect([
      mailDataSchema.safeParse({ ...MAIL, contentTextId: "" }).success,
      mailDataSchema.safeParse({ ...MAIL, senderTextId: "" }).success,
      mailDataSchema.safeParse({ ...MAIL, titleTextId: "" }).success,
    ]).toStrictEqual([false, false, false]);
  });
});

describe("birthdayMailRowsSchema", () => {
  // An effective date is read as a game time where its row is parsed, so a date that is not one is refused there
  test("refuses a birthday mail row whose effective date is not a date-time", () => {
    expect.hasAssertions();

    expect(() =>
      birthdayMailRowsSchema.parse([{ effectiveDate: "not a date", mailId: 1 }]),
    ).toThrowErrorMatchingInlineSnapshot(`[RangeError: Temporal error: Invalid character while parsing year value.]`);
  });
});
