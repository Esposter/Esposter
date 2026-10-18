import type { MailSave } from "#src/models/mail/MailSave";
import type { TravelerBirthdaySave } from "#src/models/save/TravelerBirthdaySave";

import { GAME_TIME_ZONE } from "#src/services/originalResin/constants";

export interface BirthdayMailRow {
  effectiveAt: string;
  mailId: number;
}

// The held mails with the Traveler's birthday mail added when it is due: on the birthday's day in the game's time zone,
// The mail in force by then, the latest row taking effect by the birthday, and only once in a birthday. Without a
// Birthday set nothing is due
export const deliverBirthdayMail = (
  mails: readonly MailSave[],
  birthday: TravelerBirthdaySave | undefined,
  birthdayMailRows: readonly BirthdayMailRow[],
  now: Temporal.Instant,
): MailSave[] => {
  if (birthday === undefined) return [...mails];
  const today = now.toZonedDateTimeISO(GAME_TIME_ZONE).toPlainDate();
  const birthdayDate = Temporal.PlainDate.from(
    { day: birthday.day, month: birthday.month, year: today.year },
    { overflow: "constrain" },
  );
  if (!today.equals(birthdayDate)) return [...mails];
  const birthdayStart = birthdayDate.toZonedDateTime(GAME_TIME_ZONE).toInstant();
  const inForce = birthdayMailRows
    .filter(({ effectiveAt }) => Temporal.Instant.compare(Temporal.Instant.from(effectiveAt), birthdayStart) <= 0)
    .toSorted((a, b) =>
      Temporal.Instant.compare(Temporal.Instant.from(b.effectiveAt), Temporal.Instant.from(a.effectiveAt)),
    )[0];
  if (inForce === undefined) return [...mails];
  const isDelivered = mails.some(
    ({ deliveredAt, id }) =>
      id === inForce.mailId && Temporal.Instant.compare(Temporal.Instant.from(deliveredAt), birthdayStart) >= 0,
  );
  if (isDelivered) return [...mails];
  return [...mails, { deliveredAt: now.toString(), id: inForce.mailId, isClaimed: false, isRead: false }];
};
