import { getNameStatusRows } from "#src/services/coderabbit/exclusions/getNameStatusRows";
import { describe, expect, test } from "vitest";

describe(getNameStatusRows, () => {
  const oldPath = "a";
  const newPath = "b";

  // Both similarities, because the whole reason the pair is read is the moved file that also repathed its own
  // Imports, which git scores below 100
  test.each(["R100", "R085"])("%s ends at the new path and remembers the one it came from", (status) => {
    expect.hasAssertions();

    expect(getNameStatusRows(`${status}\t${oldPath}\t${newPath}`)).toStrictEqual([
      { path: newPath, renamedFrom: oldPath, status },
    ]);
  });

  test("reads every other status to its one path, with nothing to come from", () => {
    expect.hasAssertions();

    expect(getNameStatusRows(`M\t${oldPath}\nA\t${newPath}\nD\t${oldPath}\n`)).toStrictEqual([
      { path: oldPath, status: "M" },
      { path: newPath, status: "A" },
      { path: oldPath, status: "D" },
    ]);
  });

  test("reads an empty output as no rows", () => {
    expect.hasAssertions();

    expect(getNameStatusRows("")).toStrictEqual([]);
  });
});
