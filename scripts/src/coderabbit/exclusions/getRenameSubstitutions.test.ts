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

  // The replay substitutes word-bounded, so a pair of non-identifiers or reserved words would reproduce a logic
  // Change byte for byte and pass the file off as a rename
  test("rejects a pair that is not two identifiers, or names a reserved word", () => {
    expect.hasAssertions();

    expect(() => getRenameSubstitutions(["true=false"])).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: getRenameSubstitutions, true=false]`,
    );
    expect(() => getRenameSubstitutions(["null=undefined"])).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: getRenameSubstitutions, null=undefined]`,
    );
    expect(() => getRenameSubstitutions(["a.b=c"])).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: getRenameSubstitutions, a.b=c]`,
    );
    expect(() => getRenameSubstitutions(["1=2"])).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: getRenameSubstitutions, 1=2]`,
    );
  });

  // `constructor` is not a reserved word, but word-bounded it turns a class's constructor into a method — a semantic
  // Change the exact matcher would still report as substitution-only and exclude from review as a rename
  test("rejects a name the grammar reads by spelling", () => {
    expect.hasAssertions();

    expect(() => getRenameSubstitutions(["constructor=initialize"])).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: getRenameSubstitutions, constructor=initialize]`,
    );
    expect(() => getRenameSubstitutions(["string=text"])).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: getRenameSubstitutions, string=text]`,
    );
  });
});
