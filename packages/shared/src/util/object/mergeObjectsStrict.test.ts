import { mergeObjectsStrict } from "#src/util/object/mergeObjectsStrict";
import { describe, expect, test } from "vitest";

describe(mergeObjectsStrict, () => {
  test("two sets sharing a key", () => {
    expect.hasAssertions();

    const first = { A: "a" };
    const second = { A: "b" };

    expect(() => mergeObjectsStrict(first, second)).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Create, name: mergeObjectsStrict, Duplicate key: A]`,
    );
  });

  test("sets with no key in common", () => {
    expect.hasAssertions();

    const first = { A: "a" } as const;
    const second = { B: "b" } as const;
    const third = { C: 1 } as const;

    expect(mergeObjectsStrict(first, second, third)).toStrictEqual({ A: "a", B: "b", C: 1 });
  });
});
