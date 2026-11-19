import type { KeyedView } from "#src/models/shared/overlay/KeyedView";

import { describe, expect, expectTypeOf, test } from "vitest";

describe("keyedView type", () => {
  test("an entry's view reads and writes rows by key and offers nothing that enumerates, counts or searches them", () => {
    expect.hasAssertions();

    expectTypeOf<keyof KeyedView>().toEqualTypeOf<"get" | "set">();
  });
});
