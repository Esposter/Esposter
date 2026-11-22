import type { PublishableResourceProcedureOptions } from "#server/models/resource/PublishableResourceProcedureOptions";
import type { createResourceProcedures } from "#server/trpc/procedure/resource/createResourceProcedures";
import type { ResourceContent } from "#shared/models/resource/ResourceContent";
import type { ResourceType } from "@esposter/db-schema";

import { describe, expect, expectTypeOf, test } from "vitest";

describe("createResourceProcedures type", () => {
  test("a type that is not publishable takes no publish hooks", () => {
    expect.hasAssertions();

    expectTypeOf<typeof createResourceProcedures<typeof ResourceType.Sheet>>().parameter(1).toEqualTypeOf<undefined>();
  });

  test("a publishable type takes the hooks of its own content", () => {
    expect.hasAssertions();

    expectTypeOf<typeof createResourceProcedures<typeof ResourceType.Webpage>>()
      .parameter(1)
      .toEqualTypeOf<PublishableResourceProcedureOptions<ResourceContent<typeof ResourceType.Webpage>> | undefined>();
  });
});
