import type { WikiAdvancedProperty } from "#src/models/genshinAssets/kits/wiki/WikiAdvancedProperty";

import { findLabelRows } from "#src/services/genshinAssets/kits/wiki/findLabelRows";
import { describe, expect, test } from "vitest";

describe(findLabelRows, () => {
  test("finds the row titled as the label, where `DMG per Star Jade` is titled `Star Jade`", () => {
    expect.hasAssertions();

    const properties: WikiAdvancedProperty[] = [
      { row: 1, title: "Star Jade" },
      { row: 2, title: "Press DMG" },
    ];

    expect(findLabelRows("DMG per Star Jade", properties)).toStrictEqual([properties[0]]);
  });

  test("finds the row titled as the label, where `Coordinated ATK DMG` is `Coordinated Attack DMG`", () => {
    expect.hasAssertions();

    const properties: WikiAdvancedProperty[] = [
      { row: 1, title: "Coordinated Attack DMG" },
      { row: 2, title: "Press DMG" },
    ];

    expect(findLabelRows("Coordinated ATK DMG", properties)).toStrictEqual([properties[0]]);
  });

  test("finds both bracketed rows of `Sword Rain DMG`, each titled with its variant in brackets", () => {
    expect.hasAssertions();

    const properties: WikiAdvancedProperty[] = [
      { row: 1, title: "Sword Rain DMG (Primary Sword)" },
      { row: 2, title: "Sword Rain DMG (Other Swords)" },
      { row: 3, title: "Press DMG" },
    ];

    expect(findLabelRows("Sword Rain DMG", properties)).toStrictEqual([properties[0], properties[1]]);
  });

  test("finds the row whose title's words all appear among the label's, `Press Skill DMG` finding `Press DMG`", () => {
    expect.hasAssertions();

    const properties: WikiAdvancedProperty[] = [
      { row: 1, title: "Press DMG" },
      { row: 2, title: "Hold DMG" },
    ];

    expect(findLabelRows("Press Skill DMG", properties)).toStrictEqual([properties[0]]);
  });

  test("finds the row holding all of the label's words, `Burst DMG` finding `Elemental Burst DMG`", () => {
    expect.hasAssertions();

    const properties: WikiAdvancedProperty[] = [
      { row: 1, title: "Elemental Burst DMG" },
      { row: 2, title: "Press DMG" },
    ];

    expect(findLabelRows("Burst DMG", properties)).toStrictEqual([properties[0]]);
  });

  test("finds the two bracketed rows and not `Final Slash DMG` for `Slash DMG`, the tier before the looser one", () => {
    expect.hasAssertions();

    const properties: WikiAdvancedProperty[] = [
      { row: 1, title: "Slash DMG (First Hit)" },
      { row: 2, title: "Slash DMG (Subsequent Hits)" },
      { row: 3, title: "Final Slash DMG" },
    ];

    expect(findLabelRows("Slash DMG", properties)).toStrictEqual([properties[0], properties[1]]);
  });

  test("finds no row for `1-Hit DMG`, a label with no words", () => {
    expect.hasAssertions();

    const properties: WikiAdvancedProperty[] = [
      { row: 1, title: "1-Hit DMG" },
      { row: 2, title: "Press DMG" },
    ];

    expect(findLabelRows("1-Hit DMG", properties)).toStrictEqual([]);
  });
});
