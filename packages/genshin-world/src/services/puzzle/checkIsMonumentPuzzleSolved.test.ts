import { checkIsMonumentPuzzleSolved } from "#src/services/puzzle/checkIsMonumentPuzzleSolved";
import { createMonument } from "#src/services/puzzle/createMonument.test";
import { describe, expect, test } from "vitest";

describe(checkIsMonumentPuzzleSolved, () => {
  test("is solved once every monument of it is lit together", () => {
    expect.hasAssertions();

    expect(checkIsMonumentPuzzleSolved([createMonument(true), createMonument(true)])).toBe(true);
  });

  test("is not solved while one of its monuments stays dark", () => {
    expect.hasAssertions();

    expect(checkIsMonumentPuzzleSolved([createMonument(true), createMonument(false)])).toBe(false);
  });

  test("is not solved by no monuments at all", () => {
    expect.hasAssertions();

    expect(checkIsMonumentPuzzleSolved([])).toBe(false);
  });
});
