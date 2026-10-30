import { Attribute } from "#src/models/character/Attribute";
import { formatAttributeValue } from "#src/services/character/formatAttributeValue";
import { describe, expect, test } from "vitest";

describe("formatAttributeValue", () => {
  // The bases, the flats and Elemental Mastery are whole, the rest a percentage to one place: a weapon's secondary is
  // Formatted by its kind, so an Elemental Mastery of 187.2 reads 187 and not 18720.0%
  test.each([
    [Attribute.ElementalMastery, 187.2, "187"],
    [Attribute.Attack, 311.4, "311"],
    [Attribute.BaseHealth, 12_345.4, "12,345"],
    [Attribute.Defense, 1234.6, "1,235"],
    [Attribute.CriticalRate, 0.269, "26.9%"],
    [Attribute.AttackPercent, 0.09, "9.0%"],
  ])("%s of %d reads %s", (attribute, total, text) => {
    expect.hasAssertions();

    expect(formatAttributeValue(attribute, total)).toBe(text);
  });
});
