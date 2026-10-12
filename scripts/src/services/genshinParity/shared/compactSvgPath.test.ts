import { compactSvgPath } from "#src/services/genshinParity/shared/compactSvgPath";
import { parseSvgPath } from "#src/services/genshinParity/shared/parseSvgPath";
import { describe, expect, test } from "vitest";

describe(compactSvgPath, () => {
  const SCALE = 100;
  const EXCERPT = "M 573.5 114 L 574 115.5 L 566 128.5 L 549 163.5 L 549 165.5 L 542 179.5";

  test("writes the same points, so parsing its output gives back the input's absolute geometry", () => {
    expect.hasAssertions();

    const path = "M 10.5 20 L 10.5 30 H 40 V 50 Q 60 70 80 90 C 1 2 3 4 5 6 Z M -1.25 -.5 l 2 3 4 5 A 3 3 0 1 0 6 7 Z";

    expect(parseSvgPath(compactSvgPath(path), SCALE)).toStrictEqual(parseSvgPath(path, SCALE));
  });

  test("writes an arc's flags as written and its radii and rotation unchanged", () => {
    expect.hasAssertions();

    expect(compactSvgPath("M 0 0 A 5 5 0 0 1 10 10 Z")).toBe("M0 0a5 5 0 0 1 10 10z");
  });

  test("opens absolute, so paths joined into one d keep their places", () => {
    expect.hasAssertions();

    const paths = ["M 10 10 L 20 10 L 20 20 Z", "M 50 50 L 60 50 L 60 60 Z"];

    expect(parseSvgPath(paths.map((path) => compactSvgPath(path)).join(" "), SCALE)).toStrictEqual(
      parseSvgPath(paths.join(" "), SCALE),
    );
  });

  test("writes a later moveto's repeated pairs as the lineto they imply and a line along an axis as one operand", () => {
    expect.hasAssertions();

    expect(compactSvgPath("M 0 0 Z M 1 1 2 2 L 2 1 H 1")).toBe("M0 0zm1 1 1 1v-1h-1");
  });

  test("writes an excerpt of a traced mark at its shortest, with no space before a minus sign or a point after a point", () => {
    expect.hasAssertions();

    expect(compactSvgPath(EXCERPT)).toBe("M573.5 114l.5 1.5-8 13-17 35v2l-7 14");
  });
});
