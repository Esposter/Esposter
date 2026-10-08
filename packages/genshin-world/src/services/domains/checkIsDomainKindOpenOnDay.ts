import { DomainKind } from "#src/models/domains/DomainKind";
import { SUNDAY_DAY_OF_WEEK } from "#src/services/domains/constants";

// Whether a kind of domain is open on a game day. A Domain of Forgery or Mastery is open on the two days of the week its
// Table sets for it and every Sunday; a Domain of Blessing opens every day, so its set days are not read
export const checkIsDomainKindOpenOnDay = (
  kind: DomainKind,
  day: Temporal.PlainDate,
  scheduledDaysOfWeek: readonly number[],
): boolean => {
  if (kind === DomainKind.Blessing) return true;
  return day.dayOfWeek === SUNDAY_DAY_OF_WEEK || scheduledDaysOfWeek.includes(day.dayOfWeek);
};
