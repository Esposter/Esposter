import { parseRepositoryReads } from "#src/services/outdatedDependencies/supersession/parseRepositoryReads";
import { describe, expect, test } from "vitest";

describe(parseRepositoryReads, () => {
  test("reads each aliased field back to its repository, and a null field as the reason GitHub gave", () => {
    expect.hasAssertions();

    expect(
      parseRepositoryReads(
        {
          data: { r0: { isArchived: false, nameWithOwner: "GrapesJS/components-tabs" }, r1: null },
          errors: [{ message: "Could not resolve to a Repository", path: ["r1"] }],
        },
        ["artf/grapesjs-tabs", "nope/missing"],
      ),
    ).toStrictEqual(
      new Map([
        ["artf/grapesjs-tabs", { fullName: "GrapesJS/components-tabs", isArchived: false }],
        ["nope/missing", { error: "Could not resolve to a Repository" }],
      ]),
    );
  });
});
