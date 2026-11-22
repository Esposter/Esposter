import type { createResourceProcedures } from "#server/trpc/procedure/resource/createResourceProcedures";
import type { ResourceType } from "@esposter/db-schema";

import { describe, expect, expectTypeOf, test } from "vitest";

describe("createResourceProcedures type", () => {
  test("a type that is not publishable takes no publish hooks", () => {
    expect.hasAssertions();

    expectTypeOf<typeof createResourceProcedures<typeof ResourceType.Sheet>>().parameter(1).toEqualTypeOf<undefined>();
  });
});
