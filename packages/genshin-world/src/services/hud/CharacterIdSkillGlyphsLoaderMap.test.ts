import { CharacterIdSkillGlyphsLoaderMap } from "#src/generated/characterKitMaps/CharacterIdSkillGlyphsLoaderMap";
import { describe, expect, test } from "vitest";

describe("generated character skill glyphs loader map", () => {
  const CHARACTER_ID_SUFFIX = "_CHARACTER_ID";

  const SKILL_GLYPHS_SUFFIX = "_SKILL_GLYPHS";

  // Each glyph module, by the character id its kit module of the same stem declares
  const readGlyphModules = () => {
    const kitModuleMap = import.meta.glob<Record<string, unknown>>("/src/services/kit/characters/*Kit.ts", {
      eager: true,
    });
    return Object.entries(
      import.meta.glob<Record<string, unknown>>("/src/services/hud/skillGlyphs/*SkillGlyphs.ts", { eager: true }),
    ).map(([path, glyphModule]) => {
      const kitModule =
        kitModuleMap[path.replace("/hud/skillGlyphs/", "/kit/characters/").replace(/SkillGlyphs\.ts$/u, "Kit.ts")];
      const idName = kitModule && Object.keys(kitModule).find((name) => name.endsWith(CHARACTER_ID_SUFFIX));
      const glyphsName = Object.keys(glyphModule).find((name) => name.endsWith(SKILL_GLYPHS_SUFFIX));
      return {
        characterId: idName ? kitModule[idName] : undefined,
        skillGlyphs: glyphsName ? glyphModule[glyphsName] : undefined,
      };
    });
  };

  test("holds every glyph module keyed by the character id its kit module declares", () => {
    expect.hasAssertions();

    const characterIds = readGlyphModules().map(({ characterId }) => characterId);

    expect(characterIds.every((characterId) => typeof characterId === "number")).toBe(true);
    expect(
      Object.keys(CharacterIdSkillGlyphsLoaderMap)
        .map(Number)
        .toSorted((firstId, secondId) => firstId - secondId),
    ).toStrictEqual(characterIds.toSorted((firstId, secondId) => Number(firstId) - Number(secondId)));
  });

  test("loads each character id's own module's glyphs", async () => {
    expect.hasAssertions();

    for (const { characterId, skillGlyphs } of readGlyphModules()) {
      expect(skillGlyphs).toBeDefined();
      // oxlint-disable-next-line no-await-in-loop -- each module is already loaded by the glob, so the loads cost nothing to serialise
      await expect(CharacterIdSkillGlyphsLoaderMap[Number(characterId)]?.()).resolves.toBe(skillGlyphs);
    }
  });
});
