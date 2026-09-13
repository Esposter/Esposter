import { getPureRenamePaths } from "#src/services/coderabbit/exclusions/getPureRenamePaths";
import { describe, expect, test } from "vitest";

describe(getPureRenamePaths, () => {
  test("names the new path of every R100 row and nothing else", () => {
    expect.hasAssertions();

    expect(
      getPureRenamePaths(
        [
          ["R100", "apps/web/app/old.ts", "apps/web/app/new.ts"],
          // A rename that also edited the file has a content diff to review
          ["R087", "apps/web/app/moved.ts", "apps/web/app/movedAndEdited.ts"],
          ["M", "apps/web/app/edited.ts"],
          ["A", "apps/web/app/added.ts"],
        ]
          .map((fields) => fields.join("\0"))
          .join("\0"),
      ),
    ).toStrictEqual(["apps/web/app/new.ts"]);
  });
});
