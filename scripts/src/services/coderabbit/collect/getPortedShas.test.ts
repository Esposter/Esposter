import { getPortedShas } from "#src/services/coderabbit/collect/getPortedShas";
import { describe, expect, test } from "vitest";

describe(getPortedShas, () => {
  const sha = "a".repeat(40);

  test("reads every original a ported copy names, once", () => {
    expect.hasAssertions();

    expect(
      getPortedShas(
        `subject\n\n(cherry picked from commit ${sha})\n\nsubject\n\n(cherry picked from commit ${sha})\n(cherry picked from commit ${"b".repeat(40)})\n`,
      ),
    ).toStrictEqual(new Set(["b".repeat(40), sha]));
  });

  test("reads nothing off a line that only quotes the form", () => {
    expect.hasAssertions();

    expect(
      getPortedShas(`see (cherry picked from commit ${sha}) above\n(cherry picked from commit abc)\n`),
    ).toStrictEqual(new Set());
  });
});
