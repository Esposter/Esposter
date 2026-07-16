import { dayjs } from "#shared/services/dayjs";
import { ResourceUpdatedFilter } from "@/models/resource/list/ResourceUpdatedFilter";
import { getResourceUpdatedRange } from "@/services/resource/list/getResourceUpdatedRange";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

describe(getResourceUpdatedRange, () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(0);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test("returns no range when no filter is active", () => {
    expect.hasAssertions();

    expect(getResourceUpdatedRange("")).toStrictEqual({});
  });

  test("resolves relative presets against the current time", () => {
    expect.hasAssertions();

    expect(getResourceUpdatedRange(ResourceUpdatedFilter.Last24Hours)).toStrictEqual({
      updatedAfter: dayjs(0).subtract(24, "hours").toDate(),
    });
    expect(getResourceUpdatedRange(ResourceUpdatedFilter.Last7Days)).toStrictEqual({
      updatedAfter: dayjs(0).subtract(7, "days").toDate(),
    });
    expect(getResourceUpdatedRange(ResourceUpdatedFilter.Last30Days)).toStrictEqual({
      updatedAfter: dayjs(0).subtract(30, "days").toDate(),
    });
  });

  test("passes through the custom From date and extends the To date to end-of-day", () => {
    expect.hasAssertions();

    const updatedAfter = new Date("1970-01-01");
    const updatedBefore = new Date("1970-01-02");

    expect(getResourceUpdatedRange(ResourceUpdatedFilter.Custom)).toStrictEqual({});
    expect(getResourceUpdatedRange(ResourceUpdatedFilter.Custom, updatedAfter)).toStrictEqual({ updatedAfter });
    expect(getResourceUpdatedRange(ResourceUpdatedFilter.Custom, updatedAfter, updatedBefore)).toStrictEqual({
      updatedAfter,
      updatedBefore: dayjs(updatedBefore).endOf("day").toDate(),
    });
  });
});
