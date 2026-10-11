import { buildRepositoriesQuery } from "#src/services/outdatedDependencies/supersession/buildRepositoriesQuery";
import { describe, expect, test } from "vitest";

describe(buildRepositoriesQuery, () => {
  test("names each repository as an aliased field, in the order given", () => {
    expect.hasAssertions();

    expect(buildRepositoriesQuery(["unjs/radix3", "artf/grapesjs-tabs"])).toBe(
      'query { r0: repository(owner: "unjs", name: "radix3") { nameWithOwner isArchived } r1: repository(owner: "artf", name: "grapesjs-tabs") { nameWithOwner isArchived } }',
    );
  });
});
