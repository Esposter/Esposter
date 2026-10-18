import { DomainKind } from "#src/models/domains/DomainKind";
import { SUNDAY_DAY_OF_WEEK } from "#src/services/domains/constants";
import { computeGameDay } from "#src/services/time/computeGameDay";

// Whether a kind of domain is open at a moment, on the game day that moment falls in.
// A Domain of Forgery or Mastery is open on the two days of the week its table sets for it and every Sunday.
// A Domain of Blessing or Trounce opens every day, so its set days are not read.
export const checkIsDomainKindOpenOnDay = (
  kind: DomainKind,
  now: Temporal.Instant,
  scheduledDaysOfWeek: readonly number[],
): boolean => {
  if (kind === DomainKind.Blessing || kind === DomainKind.Trounce) return true;
  const { dayOfWeek } = computeGameDay(now);
  return dayOfWeek === SUNDAY_DAY_OF_WEEK || scheduledDaysOfWeek.includes(dayOfWeek);
};
