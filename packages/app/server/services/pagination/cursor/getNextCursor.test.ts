import type { CompositeKey } from "@esposter/azure";

import { serialize } from "#shared/services/pagination/cursor/serialize";
import { getNextCursor } from "@@/server/services/pagination/cursor/getNextCursor";
import { describe, expect, test } from "vitest";

describe(getNextCursor, () => {
  test("empty array", () => {
    expect.hasAssertions();

    expect(getNextCursor([], [])).toBe("");
  });

  test("gets next cursor", () => {
    expect.hasAssertions();

    const item: CompositeKey = { partitionKey: "", rowKey: "" };

    expect(getNextCursor([item], [])).toBe(serialize(item, []));
  });
});
