import { getNameStatusRows } from "#src/services/coderabbit/exclusions/getNameStatusRows";
import { describe, expect, test } from "vitest";

describe(getNameStatusRows, () => {
  const oldPath = "a";
  const newPath = "b";

  // Both similarities, because the whole reason the pair is read is the moved file that also repathed its own
  // Imports, which git scores below 100
  test.each(["R100", "R085"])("%s ends at the new path and remembers the one it came from", (status) => {
    expect.hasAssertions();

    expect(getNameStatusRows(`${status}\0${oldPath}\0${newPath}\0`)).toStrictEqual([
      { path: newPath, renamedFrom: oldPath, status },
    ]);
  });

  test("reads every other status to its one path, with nothing to come from", () => {
    expect.hasAssertions();

    expect(getNameStatusRows(`M\0${oldPath}\0A\0${newPath}\0D\0${oldPath}\0`)).toStrictEqual([
      { path: oldPath, status: "M" },
      { path: newPath, status: "A" },
      { path: oldPath, status: "D" },
    ]);
  });

  // The whole point of `-z`: a path git would otherwise quote and escape arrives as its literal bytes
  test("reads a path holding a tab, a newline or a non-ASCII byte as its literal bytes", () => {
    expect.hasAssertions();

    const path = "a\tb\nć";

    expect(getNameStatusRows(`M\0${path}\0`)).toStrictEqual([{ path, status: "M" }]);
  });

  test("reads an empty output as no rows", () => {
    expect.hasAssertions();

    expect(getNameStatusRows("")).toStrictEqual([]);
  });
});
