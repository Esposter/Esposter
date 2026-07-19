import type { NullToUndefined } from "@/util/types/NullToUndefined";

import { describe, expect, expectTypeOf, test } from "vitest";

describe("nullToUndefined type", () => {
  test("rewrites a nullable union to an undefined union", () => {
    expect.hasAssertions();

    expectTypeOf<NullToUndefined<null | string>>().toEqualTypeOf<string | undefined>();
  });

  test("rewrites nullable fields on a row", () => {
    expect.hasAssertions();

    expectTypeOf<NullToUndefined<{ deletedAt: Date | null; id: string }>>().toEqualTypeOf<{
      deletedAt: Date | undefined;
      id: string;
    }>();
  });

  test("recurses through nested objects and arrays", () => {
    expect.hasAssertions();

    expectTypeOf<NullToUndefined<{ items: { value: null | number }[] }>>().toEqualTypeOf<{
      items: { value: number | undefined }[];
    }>();
  });
});
