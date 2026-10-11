import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { VENTI_SKILL_GLYPHS } from "#src/services/hud/skillGlyphs/ventiSkillGlyphs";
import { VENTI_CHARACTER_ID } from "#src/services/kit/characters/ventiKit";
import { XIANGLING_CHARACTER_ID } from "#src/services/kit/characters/xianglingKit";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { describe, expect, test, vi } from "vitest";

vi.mock(import("#src/generated/characterKitMaps/CharacterIdCreateKitBehaviourMap"), () => ({
  CharacterIdCreateKitBehaviourMap: {},
}));

describe(readCharacterKit, () => {
  // Its own record and multipliers hold none of the Traveler's values, so a kit built from them would differ
  test("builds the Traveler's kit from the Traveler's record and multipliers for a character the map holds no module for", async () => {
    expect.hasAssertions();

    const [kit, travelerKit] = await Promise.all([
      readCharacterKit(GAME_DATA_LOCAL_BASE_URL, XIANGLING_CHARACTER_ID),
      readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID),
    ]);

    expect(kit).toStrictEqual(travelerKit);
  });

  test("carries the character's own traced skill glyphs", async () => {
    expect.hasAssertions();

    const kit = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, VENTI_CHARACTER_ID);

    expect(kit.skillGlyphs).toBe(VENTI_SKILL_GLYPHS);
  });
});
