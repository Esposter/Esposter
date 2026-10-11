import { STABILITY_WINDOW_MONTHS } from "#src/services/dependencies/score/constants";

// The packument's `time` also carries `created` and `modified`, which are not releases
const NON_RELEASE_KEYS = new Set(["created", "modified"]);

// Releases published within the window ending on `today`, a release on the window's first day included
export const countRecentReleases = (time: Record<string, string>, today: Temporal.PlainDate): number => {
  const windowStart = today.subtract({ months: STABILITY_WINDOW_MONTHS });
  return Object.entries(time).filter(
    ([version, publishedAt]) =>
      !NON_RELEASE_KEYS.has(version) &&
      Temporal.PlainDate.compare(
        Temporal.Instant.from(publishedAt).toZonedDateTimeISO("UTC").toPlainDate(),
        windowStart,
      ) >= 0,
  ).length;
};
