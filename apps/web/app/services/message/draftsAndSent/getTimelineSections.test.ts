import { getTimelineSections } from "@/services/message/draftsAndSent/getTimelineSections";
import { getZonedDateTime } from "@esposter/shared";
import { describe, expect, test } from "vitest";

describe(getTimelineSections, () => {
  test("keeps each day in its own section, in the order given", () => {
    expect.hasAssertions();

    // The epoch's day, the day after it, and the epoch's day six years on, which shares its weekday, month and day
    const epoch = new Date(0);
    const nextDay = new Date(getZonedDateTime(epoch).add({ days: 1 }).epochMilliseconds);
    const sixYearsLater = new Date(getZonedDateTime(epoch).add({ years: 6 }).epochMilliseconds);
    const sections = getTimelineSections([sixYearsLater, nextDay, epoch], (date) => date);

    expect(sections.map(({ items }) => items)).toStrictEqual([[sixYearsLater], [nextDay], [epoch]]);
  });
});
