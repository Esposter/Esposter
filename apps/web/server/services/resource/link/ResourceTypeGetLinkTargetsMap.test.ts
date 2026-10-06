import { ResourceTypeGetLinkTargetsMap } from "#server/services/resource/link/ResourceTypeGetLinkTargetsMap";
import { ResourceType } from "@esposter/db-schema";
import { describe, expect, test } from "vitest";

describe("resourceTypeGetLinkTargetsMap", () => {
  // The law's visible output: a content schema gaining or losing a link field moves this list, and one whose
  // Conversion lost a declared field would drop out of it rather than index nothing in silence
  test("reads links off exactly the types whose content declares one", () => {
    expect.hasAssertions();

    expect([...ResourceTypeGetLinkTargetsMap.keys()]).toStrictEqual([
      ResourceType.Dashboard,
      ResourceType.Email,
      ResourceType.Program,
    ]);
  });
});
