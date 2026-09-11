import { getRenameSubstitutions } from "#src/coderabbit/exclusions/getRenameSubstitutions";
import { describe, expect, test } from "vitest";

describe(getRenameSubstitutions, () => {
  test("splits every OldName=NewName pair", () => {
    expect.hasAssertions();

    expect(getRenameSubstitutions(["OldName=NewName", "useOld=useNew"])).toStrictEqual([
      { newName: "NewName", oldName: "OldName" },
      { newName: "useNew", oldName: "useOld" },
    ]);
  });

  test("rejects an argument that is not a pair", () => {
    expect.hasAssertions();

    expect(() => getRenameSubstitutions(["OldName"])).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: getRenameSubstitutions, OldName]`,
    );
  });
});
