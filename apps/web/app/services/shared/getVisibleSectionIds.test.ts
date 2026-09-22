import { getVisibleSectionIds } from "@/services/shared/getVisibleSectionIds";
import { describe, expect, test } from "vitest";

describe(getVisibleSectionIds, () => {
  const VIEWPORT_BOTTOM = 800;
  // What the headings' own `scroll-margin-top` reserves for the sticky app bar, so the effective top of the
  // Viewport is below its real one
  const VIEWPORT_TOP = 100;
  const sections = [
    { id: "a", top: -400 },
    { id: "b", top: 200 },
    { id: "c", top: 600 },
    { id: "d", top: 1200 },
  ];

  // The reason the rail stretches rather than points: reading under one heading while the next is on screen is
  // Two sections being read at once, and both are highlighted
  test("returns every section overlapping the viewport", () => {
    expect.hasAssertions();

    expect(getVisibleSectionIds(sections, VIEWPORT_TOP, VIEWPORT_BOTTOM)).toStrictEqual(["a", "b", "c"]);
  });

  // The case that separates this from "which headings are on screen", and the one a rewrite is most likely to
  // Lose: mid-way through a long section, neither its heading nor the next one is anywhere near the viewport
  test("returns the section being read even when no heading is on screen", () => {
    expect.hasAssertions();

    const longSection = [
      { id: "a", top: -5000 },
      { id: "b", top: 5000 },
    ];

    expect(getVisibleSectionIds(longSection, VIEWPORT_TOP, VIEWPORT_BOTTOM)).toStrictEqual(["a"]);
  });

  // A section whose next heading has passed the sticky bar is behind it, however far its own heading is above
  test("drops a section once the next heading clears the sticky offset", () => {
    expect.hasAssertions();

    const scrolledPast = [
      { id: "a", top: -900 },
      { id: "b", top: 50 },
    ];

    expect(getVisibleSectionIds(scrolledPast, VIEWPORT_TOP, VIEWPORT_BOTTOM)).toStrictEqual(["b"]);
  });

  // Clicking a table-of-contents link lands its heading on the top line, which leaves a sub-pixel sliver of the
  // Section above still technically overlapping, and counting it lights up the section before the one clicked
  test("drops the section above when an anchor lands its heading on the top line", () => {
    expect.hasAssertions();

    const justLanded = [
      { id: "a", top: -700 },
      { id: "b", top: VIEWPORT_TOP + 0.5 },
    ];

    expect(getVisibleSectionIds(justLanded, VIEWPORT_TOP, VIEWPORT_BOTTOM)).toStrictEqual(["b"]);
  });

  test("runs the last section to the bottom of the document", () => {
    expect.hasAssertions();

    expect(getVisibleSectionIds([{ id: "a", top: -9000 }], VIEWPORT_TOP, VIEWPORT_BOTTOM)).toStrictEqual(["a"]);
  });

  test("returns nothing when every section is below the viewport", () => {
    expect.hasAssertions();

    expect(getVisibleSectionIds([{ id: "a", top: 900 }], VIEWPORT_TOP, VIEWPORT_BOTTOM)).toStrictEqual([]);
  });
});
