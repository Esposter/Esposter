import { EMPTY_TYPE_ROOTS_DIRECTORY } from "#src/services/benchTypes/constants";
import { toCompilerFlags } from "#src/services/benchTypes/toCompilerFlags";
import { describe, expect, test } from "vitest";

describe(toCompilerFlags, () => {
  test("a true switch, a list and a value become flags; a false switch and a checking-free output do not", () => {
    expect.hasAssertions();

    expect(
      toCompilerFlags({
        composite: true,
        customConditions: ["source"],
        incremental: true,
        lib: ["esnext", "dom"],
        noEmit: true,
        strict: false,
        target: "esnext",
        types: [],
      }),
    ).toStrictEqual([
      "--customConditions",
      "source",
      "--lib",
      "esnext,dom",
      "--noEmit",
      "--target",
      "esnext",
      "--typeRoots",
      EMPTY_TYPE_ROOTS_DIRECTORY,
    ]);
  });

  test("a named list of types replaces the empty type roots", () => {
    expect.hasAssertions();

    expect(toCompilerFlags({ types: ["node"] })).toStrictEqual(["--types", "node"]);
  });
});
