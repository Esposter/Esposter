import type { AbyssPeriod } from "#src/models/spiralAbyss/AbyssPeriod";

import { GAME_TIME_ZONE } from "#src/services/time/constants";

// The period the Moon Spire offers at an instant: the one whose opening has come and whose last second has not passed, read in
// The game's time zone to the whole second. Undefined when no period covers the instant, as none does before the first opens
export const findAbyssPeriodAt = (periods: readonly AbyssPeriod[], now: Temporal.Instant): AbyssPeriod | undefined => {
  const gameTime = now
    .toZonedDateTimeISO(GAME_TIME_ZONE)
    .toPlainDateTime()
    .round({ roundingMode: "floor", smallestUnit: "second" });
  return periods.find(
    ({ closesAt, startsAt }) =>
      Temporal.PlainDateTime.compare(Temporal.PlainDateTime.from(startsAt), gameTime) <= 0 &&
      Temporal.PlainDateTime.compare(gameTime, Temporal.PlainDateTime.from(closesAt)) <= 0,
  );
};
