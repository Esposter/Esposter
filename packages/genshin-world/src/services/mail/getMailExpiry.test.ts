import { MailExpiryUnit } from "#src/models/mail/MailExpiryUnit";
import { getMailExpiry } from "#src/services/mail/getMailExpiry";
import { describe, expect, test } from "vitest";

describe(getMailExpiry, () => {
  const DELIVERED_AT = new Date(0).toISOString();
  const EXPIRE_DAYS = 365;
  const expiresAt = Temporal.Instant.from(DELIVERED_AT).add({ hours: EXPIRE_DAYS * 24 });
  const before = (ms: number) => Temporal.Instant.fromEpochMilliseconds(expiresAt.epochMilliseconds - ms);

  // Days are shown while a mail has a day or more left
  test("a mail with days left shows its days", () => {
    expect.hasAssertions();

    expect(getMailExpiry(DELIVERED_AT, EXPIRE_DAYS, before(3 * 86_400_000 + 1000))).toStrictEqual({
      count: 3,
      unit: MailExpiryUnit.Day,
    });
  });

  // Hours are shown once under a day is left
  test("a mail with hours left shows its hours", () => {
    expect.hasAssertions();

    expect(getMailExpiry(DELIVERED_AT, EXPIRE_DAYS, before(5 * 3_600_000))).toStrictEqual({
      count: 5,
      unit: MailExpiryUnit.Hour,
    });
  });

  // Minutes are shown once under an hour is left
  test("a mail with minutes left shows its minutes", () => {
    expect.hasAssertions();

    expect(getMailExpiry(DELIVERED_AT, EXPIRE_DAYS, before(42 * 60_000))).toStrictEqual({
      count: 42,
      unit: MailExpiryUnit.Minute,
    });
  });

  // Under a minute is left, the mail says so rather than a count
  test("a mail with under a minute left says so", () => {
    expect.hasAssertions();

    expect(getMailExpiry(DELIVERED_AT, EXPIRE_DAYS, before(30_000))).toStrictEqual({
      count: 0,
      unit: MailExpiryUnit.LessThanMinute,
    });
  });
});
