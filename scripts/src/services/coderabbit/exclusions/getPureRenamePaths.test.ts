import { getPureRenamePaths } from "#src/services/coderabbit/exclusions/getPureRenamePaths";
import { describe, expect, test } from "vitest";

describe(getPureRenamePaths, () => {
  test("names the new path of every R100 row and nothing else", () => {
    expect.hasAssertions();

    expect(
      getPureRenamePaths(
        [
          "R100\tapps/web/app/old.ts\tapps/web/app/new.ts",
          // A rename that also edited the file has a content diff to review
          "R087\tapps/web/app/moved.ts\tapps/web/app/movedAndEdited.ts",
          "M\tapps/web/app/edited.ts",
          "A\tapps/web/app/added.ts",
          "",
        ].join("\n"),
      ),
    ).toStrictEqual(["apps/web/app/new.ts"]);
  });
});
