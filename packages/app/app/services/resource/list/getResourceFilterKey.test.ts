import type { ResourceFilterValues } from "@/models/resource/list/ResourceFilterValues";

import { dayjs } from "#shared/services/dayjs";
import { ResourceUpdatedFilter } from "@/models/resource/list/ResourceUpdatedFilter";
import { getResourceFilterKey } from "@/services/resource/list/getResourceFilterKey";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

describe(getResourceFilterKey, () => {
  const values: ResourceFilterValues = {
    searchQuery: "",
    status: "",
    tagName: "",
    tagValue: "",
    types: [],
    updatedFilter: "",
  };

  beforeEach(() => {
    vi.useFakeTimers({ now: 0 });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // A relative preset resolves its boundary against the current time, so a key built from the resolved input
  // Would never repeat and the total would be re-counted on every page turn, page-size change and sort
  test("keys a relative preset by the selection rather than the boundary it resolves to", () => {
    expect.hasAssertions();

    const key = getResourceFilterKey({ ...values, updatedFilter: ResourceUpdatedFilter.Last7Days });
    vi.setSystemTime(dayjs(0).add(1, "day").toDate());

    expect(getResourceFilterKey({ ...values, updatedFilter: ResourceUpdatedFilter.Last7Days })).toBe(key);
    expect(getResourceFilterKey({ ...values, updatedFilter: ResourceUpdatedFilter.Last30Days })).not.toBe(key);
  });

  // A custom range is the two dates the user picked, so it is the one Updated selection whose dates are part
  // Of the filter's identity
  test("keys a custom range by its dates", () => {
    expect.hasAssertions();

    const customValues = {
      ...values,
      updatedAfter: dayjs(0).toDate(),
      updatedFilter: ResourceUpdatedFilter.Custom,
    } satisfies ResourceFilterValues;

    expect(getResourceFilterKey(customValues)).not.toBe(
      getResourceFilterKey({ ...customValues, updatedAfter: dayjs(0).add(1, "day").toDate() }),
    );
  });

  // The queries normalize a tag name before they send it, so two spellings of one filter are one filter and
  // Share a total
  test("keys the tag filters by their normalized value", () => {
    expect.hasAssertions();

    expect(getResourceFilterKey({ ...values, tagName: " name " })).toBe(
      getResourceFilterKey({ ...values, tagName: "name" }),
    );
  });
});
