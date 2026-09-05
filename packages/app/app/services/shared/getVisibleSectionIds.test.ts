import { getVisibleSectionIds } from "@/services/shared/getVisibleSectionIds";
import { describe, expect, test } from "vitest";

describe(getVisibleSectionIds, () => {
  const VIEWPORT_BOTTOM = 800;
  // What the headings' own `scroll-margin-top` reserves for the sticky app bar, so the effective top of the
  // Viewport is below its real one
  const VIEWPORT_TOP = 100;
  const sections = [
    { id: "first", top: -400 },
    { id: "second", top: 200 },
    { id: "third", top: 600 },
    { id: "fourth", top: 1200 },
  ];

  // The reason the rail stretches rather than points: reading under one heading while the next is on screen is
  // Two sections being read at once, and both are highlighted
  test("returns every section overlapping the viewport", () => {
    expect.hasAssertions();

    expect(getVisibleSectionIds(sections, VIEWPORT_TOP, VIEWPORT_BOTTOM)).toStrictEqual(["first", "second", "third"]);
  });

  // The case that separates this from "which headings are on screen", and the one a rewrite is most likely to
  // Lose: mid-way through a long section, neither its heading nor the next one is anywhere near the viewport
  test("returns the section being read even when no heading is on screen", () => {
    expect.hasAssertions();

    const longSection = [
      { id: "before", top: -5000 },
      { id: "after", top: 5000 },
    ];

    expect(getVisibleSectionIds(longSection, VIEWPORT_TOP, VIEWPORT_BOTTOM)).toStrictEqual(["before"]);
  });

  // A section whose next heading has passed the sticky bar is behind it, however far its own heading is above
  test("drops a section once the next heading clears the sticky offset", () => {
    expect.hasAssertions();

    const scrolledPast = [
      { id: "read", top: -900 },
      { id: "reading", top: 50 },
    ];

    expect(getVisibleSectionIds(scrolledPast, VIEWPORT_TOP, VIEWPORT_BOTTOM)).toStrictEqual(["reading"]);
  });

  // Clicking a table-of-contents link lands its heading on the top line, which leaves a sub-pixel sliver of the
  // Section above still technically overlapping, and counting it lights up the section before the one clicked
  test("drops the section above when an anchor lands its heading on the top line", () => {
    expect.hasAssertions();

    const justLanded = [
      { id: "previous", top: -700 },
      { id: "clicked", top: VIEWPORT_TOP + 0.5 },
    ];

    expect(getVisibleSectionIds(justLanded, VIEWPORT_TOP, VIEWPORT_BOTTOM)).toStrictEqual(["clicked"]);
  });

  test("runs the last section to the bottom of the document", () => {
    expect.hasAssertions();

    expect(getVisibleSectionIds([{ id: "only", top: -9000 }], VIEWPORT_TOP, VIEWPORT_BOTTOM)).toStrictEqual(["only"]);
  });

  test("returns nothing when every section is below the viewport", () => {
    expect.hasAssertions();

    expect(getVisibleSectionIds([{ id: "later", top: 900 }], VIEWPORT_TOP, VIEWPORT_BOTTOM)).toStrictEqual([]);
  });
});
