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

  test("finds only its own row for `Skill 1-Hit DMG`, not the `Skill 2-Hit DMG` row that shares its words", () => {
    expect.hasAssertions();

    const properties: WikiAdvancedProperty[] = [
      { row: 1, title: "Skill 1-Hit DMG" },
      { row: 2, title: "Skill 2-Hit DMG" },
    ];

    expect(findLabelRows("Skill 1-Hit DMG", properties)).toStrictEqual([properties[0]]);
  });

  test("finds only its own row for `Skill 2-Hit DMG`, not the `Skill 1-Hit DMG` row that shares its words", () => {
    expect.hasAssertions();

    const properties: WikiAdvancedProperty[] = [
      { row: 1, title: "Skill 1-Hit DMG" },
      { row: 2, title: "Skill 2-Hit DMG" },
    ];

    expect(findLabelRows("Skill 2-Hit DMG", properties)).toStrictEqual([properties[1]]);
  });

  test("finds the row titled `1-Hit DMG` for that label, which has no words for the word tiers to match", () => {
    expect.hasAssertions();

    const properties: WikiAdvancedProperty[] = [
      { row: 1, title: "1-Hit DMG" },
      { row: 2, title: "Press DMG" },
    ];

    expect(findLabelRows("1-Hit DMG", properties)).toStrictEqual([properties[0]]);
  });

  test("finds only the 2-Hit row for `Lunar Phase Shift 2-Hit DMG`, not the 1-Hit or 4-Hit rows that share its words", () => {
    expect.hasAssertions();

    const properties: WikiAdvancedProperty[] = [
      { row: 1, title: "Lunar Phase Shift 1-Hit" },
      { row: 2, title: "Lunar Phase Shift 2-Hit" },
      { row: 3, title: "Lunar Phase Shift 4-Hit" },
    ];

    expect(findLabelRows("Lunar Phase Shift 2-Hit DMG", properties)).toStrictEqual([properties[1]]);
  });

  test("finds only its own 1-Hit row for `Spirit Steed's Stride 1-Hit DMG`, not the 2-Hit row that shares its words", () => {
    expect.hasAssertions();

    const properties: WikiAdvancedProperty[] = [
      { row: 1, title: "Spirit Steed's Stride 1-Hit" },
      { row: 2, title: "Spirit Steed's Stride 2-Hit" },
    ];

    expect(findLabelRows("Spirit Steed's Stride 1-Hit DMG", properties)).toStrictEqual([properties[0]]);
  });

  test("finds the rows titled as the label and a place, `4-Hit DMG 1` and `4-Hit DMG 2` for `4-Hit DMG`", () => {
    expect.hasAssertions();

    const properties: WikiAdvancedProperty[] = [
      { row: 1, title: "4-Hit DMG 1" },
      { row: 2, title: "4-Hit DMG 2" },
      { row: 3, title: "Press DMG" },
    ];

    expect(findLabelRows("4-Hit DMG", properties)).toStrictEqual([properties[0], properties[1]]);
  });

  test("finds the rows titled as the label and a letter, `4-Hit DMG A` and `4-Hit DMG B` for `4-Hit DMG`", () => {
    expect.hasAssertions();

    const properties: WikiAdvancedProperty[] = [
      { row: 1, title: "4-Hit DMG A" },
      { row: 2, title: "4-Hit DMG B" },
    ];

    expect(findLabelRows("4-Hit DMG", properties)).toStrictEqual([properties[0], properties[1]]);
  });
});
