import type { JsonPatchOperation } from "#src/models/jsonPatch/JsonPatchOperation";

import { JsonPatchOperationType } from "#src/models/jsonPatch/JsonPatchOperationType";
import { applyPatches } from "#src/services/jsonPatch/applyPatches";
import { InvalidOperationError } from "#src/models/error/InvalidOperationError";
import { Operation } from "#src/models/shared/Operation";
import { describe, expect, test } from "vitest";

describe(applyPatches, () => {
  const document = { a: [{ b: 0 }, { b: 1 }], c: { d: "" } };

  test.each<[string, JsonPatchOperation[]]>([
    ["add appending", [{ op: JsonPatchOperationType.Add, path: "/a/-", value: { b: 2 } }]],
    ["add inserting", [{ op: JsonPatchOperationType.Add, path: "/a/0", value: { b: 2 } }]],
    ["add setting a key", [{ op: JsonPatchOperationType.Add, path: "/c/e", value: "" }]],
    ["add replacing a key", [{ op: JsonPatchOperationType.Add, path: "/c/d", value: "e" }]],
    ["add replacing the root", [{ op: JsonPatchOperationType.Add, path: "", value: [] }]],
    ["remove", [{ op: JsonPatchOperationType.Remove, path: "/a/0" }]],
    ["replace", [{ op: JsonPatchOperationType.Replace, path: "/a/1/b", value: 2 }]],
    ["move", [{ from: "/a/0", op: JsonPatchOperationType.Move, path: "/a/1" }]],
    ["move onto itself", [{ from: "/a/0", op: JsonPatchOperationType.Move, path: "/a/0" }]],
    ["move between containers", [{ from: "/c/d", op: JsonPatchOperationType.Move, path: "/a/0/b" }]],
    ["copy", [{ from: "/a/0", op: JsonPatchOperationType.Copy, path: "/c/e" }]],
    ["test", [{ op: JsonPatchOperationType.Test, path: "/a/1", value: { b: 1 } }]],
  ])("%s, undone by its inverses", (_title, operations) => {
    expect.hasAssertions();

    const { document: patchedDocument, inverses } = applyPatches(document, operations);

    expect(applyPatches(patchedDocument, inverses).document).toStrictEqual(document);
  });

  test("applies each operation to what the one before it left", () => {
    expect.hasAssertions();

    const { document: patchedDocument } = applyPatches(document, [
      { op: JsonPatchOperationType.Add, path: "/a/-", value: { b: 2 } },
      { from: "/a/2", op: JsonPatchOperationType.Move, path: "/a/0" },
      { op: JsonPatchOperationType.Remove, path: "/c/d" },
      { from: "/a/0", op: JsonPatchOperationType.Copy, path: "/c/e" },
    ]);

    expect(patchedDocument).toStrictEqual({ a: [{ b: 2 }, { b: 0 }, { b: 1 }], c: { e: { b: 2 } } });
  });

  test("shares every subtree no operation reached", () => {
    expect.hasAssertions();

    const { document: patchedDocument } = applyPatches(document, [
      { op: JsonPatchOperationType.Replace, path: "/a/1/b", value: 2 },
    ]);

    expect(patchedDocument.a[0]).toBe(document.a[0]);
    expect(patchedDocument.c).toBe(document.c);
    expect(patchedDocument.a[1]).not.toBe(document.a[1]);
    expect(document.a[1]).toStrictEqual({ b: 1 });
  });

  test("decodes an escaped pointer", () => {
    expect.hasAssertions();

    const { document: patchedDocument } = applyPatches({ "~/": 0 }, [
      { op: JsonPatchOperationType.Replace, path: "/~0~1", value: 1 },
    ]);

    expect(patchedDocument).toStrictEqual({ "~/": 1 });
  });

  test("applies nothing when an operation fails", () => {
    expect.hasAssertions();

    expect(() =>
      applyPatches(document, [
        { op: JsonPatchOperationType.Remove, path: "/a/0" },
        { op: JsonPatchOperationType.Test, path: "/a/0/b", value: 0 },
      ]),
    ).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: ${new InvalidOperationError(Operation.Read, "/a/0/b", "the value differs from the test's").message}]`,
    );
    expect(document.a).toHaveLength(2);
  });

  test("refuses an index past the end", () => {
    expect.hasAssertions();

    expect(() =>
      applyPatches(document, [{ op: JsonPatchOperationType.Remove, path: "/a/2" }]),
    ).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: ${new InvalidOperationError(Operation.Delete, "/a/2", "no such member").message}]`,
    );
  });

  test("refuses an index with a leading zero", () => {
    expect.hasAssertions();

    expect(() =>
      applyPatches(document, [{ op: JsonPatchOperationType.Replace, path: "/a/01", value: 0 }]),
    ).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: ${new InvalidOperationError(Operation.Read, "/a/01", "no such member").message}]`,
    );
  });

  test("refuses a missing key", () => {
    expect.hasAssertions();

    expect(() =>
      applyPatches(document, [{ op: JsonPatchOperationType.Replace, path: "/c/e", value: 0 }]),
    ).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: ${new InvalidOperationError(Operation.Read, "/c/e", "no such member").message}]`,
    );
  });

  test("refuses a move into the value's own child", () => {
    expect.hasAssertions();

    expect(() =>
      applyPatches(document, [{ from: "/c", op: JsonPatchOperationType.Move, path: "/c/d" }]),
    ).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: ${new InvalidOperationError(Operation.Update, "/c/d", "a value cannot move into itself").message}]`,
    );
  });

  test("refuses a pointer that does not start at the root", () => {
    expect.hasAssertions();

    expect(() =>
      applyPatches(document, [{ op: JsonPatchOperationType.Remove, path: "a" }]),
    ).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: ${new InvalidOperationError(Operation.Read, "a", "not a JSON Pointer").message}]`,
    );
  });
});
