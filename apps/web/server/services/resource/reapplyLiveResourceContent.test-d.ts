import type { ResourceContent } from "#shared/models/resource/ResourceContent";
import type { ResourceInResource } from "@esposter/db-schema";

import { reapplyLiveResourceContent } from "#server/services/resource/reapplyLiveResourceContent";
import { ResourceType } from "@esposter/db-schema";
import { describe, expect, expectTypeOf, test } from "vitest";

declare const resource: ResourceInResource;
declare const surveyContent: ResourceContent<typeof ResourceType.Survey>;

describe("reapplyLiveResourceContent type", () => {
  test("a type's content is taken and returned as that type's own content", () => {
    expect.hasAssertions();

    expectTypeOf<typeof reapplyLiveResourceContent<typeof ResourceType.Survey>>()
      .parameter(2)
      .toEqualTypeOf<ResourceContent<typeof ResourceType.Survey>>();
    expectTypeOf<typeof reapplyLiveResourceContent<typeof ResourceType.Survey>>().returns.toEqualTypeOf<
      Promise<ResourceContent<typeof ResourceType.Survey>>
    >();
  });

  test("a survey's content is refused for a note", async () => {
    expect.hasAssertions();

    // @ts-expect-error: TS2345 - a survey's content is not the content of a note
    await reapplyLiveResourceContent(ResourceType.Note, resource, surveyContent);
  });
});
