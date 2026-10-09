import { GAME_TIME_ZONE } from "#src/services/originalResin/constants";
import { findLatestBegun } from "#src/services/shared/findLatestBegun";
import { describe, expect, test } from "vitest";

const getStartsAt = ({ startsAt }: { id: number; startsAt: string }) => startsAt;

describe(findLatestBegun, () => {
  const EPOCH = Temporal.Instant.fromEpochMilliseconds(0);
  const EPOCH_ZONED = EPOCH.toZonedDateTimeISO(GAME_TIME_ZONE);
  const EPOCH_LOCAL_START = EPOCH_ZONED.toPlainDateTime();
  const SECOND_START = EPOCH_LOCAL_START.add({ days: 30 });
  // Listed out of order, as a schedule table holds its rows
  const items = [
    { id: 2, startsAt: SECOND_START.toString() },
    { id: 1, startsAt: EPOCH_LOCAL_START.toString() },
  ];

  test("should return the item that began latest before now", () => {
    expect.hasAssertions();

    expect(findLatestBegun(items, getStartsAt, EPOCH_ZONED.add({ days: 31 }).toInstant())).toStrictEqual(items[0]);
  });

  test("should keep the last item once it has ended, as a dump holds no end", () => {
    expect.hasAssertions();

    expect(findLatestBegun(items, getStartsAt, EPOCH_ZONED.add({ days: 365 }).toInstant())).toStrictEqual(items[0]);
  });

  test("should return undefined before the first item begins", () => {
    expect.hasAssertions();

    expect(findLatestBegun(items, getStartsAt, EPOCH_ZONED.subtract({ days: 1 }).toInstant())).toBeUndefined();
  });
});
