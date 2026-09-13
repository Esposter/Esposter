import { getFileDiffs } from "#src/services/coderabbit/exclusions/getFileDiffs";
import { describe, expect, test } from "vitest";

describe(getFileDiffs, () => {
  const oldPath = "old dir/a.ts";
  const newPath = "new dir/a.ts";
  const editedPath = "b.ts";
  const renameDiff = `diff --git a/${oldPath} b/${newPath}\nsimilarity index 100%\nrename from ${oldPath}\nrename to ${newPath}\n`;
  const editDiff = `diff --git a/${editedPath} b/${editedPath}\nindex 1..2 100644\n--- a/${editedPath}\n+++ b/${editedPath}\n@@ -1 +1 @@\n-import { a } from "x";\n+import { a } from "y";\n`;

  // The header is matched, never parsed: a path with a space would be ambiguous to split and is exact to predict
  test("keys each file's diff by the path the rename pair predicts", () => {
    expect.hasAssertions();

    expect(
      getFileDiffs(`${renameDiff}${editDiff}`, [
        { path: newPath, renamedFrom: oldPath, status: "R100" },
        { path: editedPath, status: "M" },
      ]),
    ).toStrictEqual(
      new Map([
        [editedPath, editDiff],
        [newPath, renameDiff],
      ]),
    );
  });

  test("leaves out a file whose header nothing predicts", () => {
    expect.hasAssertions();

    expect(getFileDiffs(editDiff, [{ path: editedPath, renamedFrom: oldPath, status: "R090" }])).toStrictEqual(
      new Map(),
    );
  });
});
