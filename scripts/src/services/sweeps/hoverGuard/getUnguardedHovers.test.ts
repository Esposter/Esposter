import { getUnguardedHovers } from "#src/services/sweeps/hoverGuard/getUnguardedHovers";
import { describe, expect, test } from "vitest";

describe(getUnguardedHovers, () => {
  // A scan that reports nothing reads exactly like a clean tree, so it owes a planted violation it does report first
  test("reports a hover rule outside the hover media query, with its line", () => {
    expect.hasAssertions();

    expect(getUnguardedHovers(".a {\n  color: red;\n}\n\n.b:hover {\n  color: blue;\n}")).toStrictEqual([
      "5: .b:hover",
    ]);
  });

  test("reports each selector of a list that names a hover", () => {
    expect.hasAssertions();

    expect(getUnguardedHovers(".a:hover,\n.b:focus-visible {\n  color: blue;\n}")).toStrictEqual([
      "1: .a:hover,\n.b:focus-visible",
    ]);
  });

  test("skips a hover rule inside the hover media query", () => {
    expect.hasAssertions();

    expect(getUnguardedHovers("@media (hover: hover) {\n  .a:hover {\n    color: blue;\n  }\n}")).toStrictEqual([]);
  });

  test("reports a hover rule inside a negated hover media query, which applies to touch-only screens", () => {
    expect.hasAssertions();

    expect(getUnguardedHovers("@media not (hover: hover) {\n  .a:hover {\n    color: blue;\n  }\n}")).toStrictEqual([
      "2: .a:hover",
    ]);
  });

  test("reports a hover rule inside a media query that is not the hover one", () => {
    expect.hasAssertions();

    expect(getUnguardedHovers("@media (min-width: 600px) {\n  .a:hover {\n    color: blue;\n  }\n}")).toStrictEqual([
      "2: .a:hover",
    ]);
  });

  test("skips the focus and forced Hover selectors, which draw unguarded", () => {
    expect.hasAssertions();

    expect(
      getUnguardedHovers('.a:is(:focus-visible, [data-interaction-state="Hover"] *) {\n  color: blue;\n}'),
    ).toStrictEqual([]);
  });

  test("skips a hover named in a comment", () => {
    expect.hasAssertions();

    expect(getUnguardedHovers("/* .a:hover { } */\n.a {\n  color: red;\n}")).toStrictEqual([]);
  });

  test("counts the line from the one the style block starts on", () => {
    expect.hasAssertions();

    expect(getUnguardedHovers(".a:hover {\n  color: blue;\n}", 40)).toStrictEqual(["40: .a:hover"]);
  });
});
