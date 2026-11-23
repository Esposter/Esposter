import { birthdayMailRowsSchema } from "#src/models/mail/MailData";
import { describe, expect, test } from "vitest";

describe("birthdayMailRowsSchema", () => {
  // An effective date is read as a game time where its row is parsed, so a date that is not one is refused there
  test("refuses a birthday mail row whose effective date is not a date-time", () => {
    expect.hasAssertions();

    expect(() =>
      birthdayMailRowsSchema.parse([{ effectiveDate: "not a date", mailId: 1 }]),
    ).toThrowErrorMatchingInlineSnapshot(`[RangeError: Temporal error: Invalid character while parsing year value.]`);
  });
});
