// @vitest-environment happy-dom
import { checkIsPanzoomExcluded } from "#src/services/panzoom/checkIsPanzoomExcluded";
import { PANZOOM_DEFAULT_EXCLUDE_CLASS } from "#src/services/panzoom/constants";
import { describe, expect, test } from "vitest";

describe(checkIsPanzoomExcluded, () => {
  test("a target inside an excluded element is excluded, and a sibling of it is not", () => {
    expect.hasAssertions();

    const parent = document.createElement("div");
    const child = document.createElement("span");
    const sibling = document.createElement("span");
    parent.append(child);

    expect(checkIsPanzoomExcluded(child, { exclude: [parent] })).toBe(true);
    expect(checkIsPanzoomExcluded(sibling, { exclude: [parent] })).toBe(false);
  });

  test("a target inside an element with the exclude class is excluded, under the class the options name", () => {
    expect.hasAssertions();

    const parent = document.createElement("div");
    const child = document.createElement("span");
    parent.append(child);
    parent.classList.add(PANZOOM_DEFAULT_EXCLUDE_CLASS);

    expect(checkIsPanzoomExcluded(child, {})).toBe(true);
    expect(checkIsPanzoomExcluded(child, { excludeClass: "custom" })).toBe(false);
  });
});
