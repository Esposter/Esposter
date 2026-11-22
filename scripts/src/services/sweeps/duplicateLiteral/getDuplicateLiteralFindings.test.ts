import { getDuplicateLiteralFindings } from "#src/services/sweeps/duplicateLiteral/getDuplicateLiteralFindings";
import { describe, expect, test } from "vitest";

describe(getDuplicateLiteralFindings, () => {
  test.each([
    [
      "a literal two files hold",
      [
        { path: "a.ts", text: 'const x = "Shared text";' },
        { path: "b.ts", text: 'const y = "Shared text";' },
      ],
      [{ count: 2, literal: '"Shared text"', paths: ["a.ts", "b.ts"] }],
    ],
    ["a literal one file repeats", [{ path: "a.ts", text: 'f("Repeated text"); g("Repeated text");' }], []],
  ])("finds %s", (_description, files, expected) => {
    expect.hasAssertions();

    expect(getDuplicateLiteralFindings(files)).toStrictEqual(expected);
  });
});
