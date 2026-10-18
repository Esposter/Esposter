import type { MailSave } from "#src/models/mail/MailSave";

import { deliverBirthdayMail } from "#src/services/mail/deliverBirthdayMail";
import { GAME_TIME_ZONE } from "#src/services/time/constants";
import { describe, expect, test } from "vitest";

describe(deliverBirthdayMail, () => {
  const BIRTHDAY = { day: 1, month: 1 };
  const BIRTHDAY_NOON = Temporal.PlainDate.from({ day: 1, month: 1, year: 1971 })
    .toZonedDateTime(GAME_TIME_ZONE)
    .add({ hours: 12 })
    .toInstant();
  const BIRTHDAY_ROWS = [
    { effectiveDate: "1970-01-01 08:00:00", mailId: 9 },
    { effectiveDate: "1970-04-11 08:00:00", mailId: 35 },
  ];

  // The birthday mail in force on the birthday is delivered on it, the latest row taking effect by then
  test("the Traveler's birthday mail is delivered on the birthday", () => {
    expect.hasAssertions();

    expect(deliverBirthdayMail([], BIRTHDAY, BIRTHDAY_ROWS, BIRTHDAY_NOON)).toStrictEqual([
      { deliveredAt: BIRTHDAY_NOON.toString(), id: 35, isClaimed: false, isPinned: false, isRead: false },
    ]);
  });

  // The day after the birthday, no mail is due
  test("the birthday mail is not delivered off the birthday", () => {
    expect.hasAssertions();

    expect(deliverBirthdayMail([], BIRTHDAY, BIRTHDAY_ROWS, BIRTHDAY_NOON.add({ hours: 24 }))).toStrictEqual([]);
  });

  // A birthday mail already delivered on this birthday is not delivered again
  test("the birthday mail is delivered once a birthday", () => {
    expect.hasAssertions();

    const delivered: MailSave[] = [
      { deliveredAt: BIRTHDAY_NOON.toString(), id: 35, isClaimed: false, isPinned: false, isRead: false },
    ];

    expect(deliverBirthdayMail(delivered, BIRTHDAY, BIRTHDAY_ROWS, BIRTHDAY_NOON)).toStrictEqual(delivered);
  });

  // A player who has not set a birthday has no birthday mail due
  test("no birthday set delivers nothing", () => {
    expect.hasAssertions();

    expect(deliverBirthdayMail([], undefined, BIRTHDAY_ROWS, BIRTHDAY_NOON)).toStrictEqual([]);
  });
});
