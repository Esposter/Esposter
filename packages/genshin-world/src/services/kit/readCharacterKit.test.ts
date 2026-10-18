import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { CombatTalent } from "#src/models/character/CombatTalent";
import { GameDataset } from "#src/models/data/GameDataset";
import { skillGlyphsSchema } from "#src/models/hud/SkillGlyphs";
import { TALENT_START_LEVELS, TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { readGameDataEntry } from "#src/services/data/readGameDataEntry";
import { NEFER_CHARACTER_ID } from "#src/services/kit/characters/neferKit";
import { VENTI_CHARACTER_ID } from "#src/services/kit/characters/ventiKit";
import { XIANGLING_CHARACTER_ID } from "#src/services/kit/characters/xianglingKit";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { takeOne } from "@esposter/shared";
import { describe, expect, test, vi } from "vitest";

vi.mock(import("#src/generated/characterKitMap/CharacterIdCreateKitBehaviourMap"), async () => {
  // Hoisted above the imports, so the factory reads Nefer's module on its own
  const { createNeferKitBehaviour, NEFER_CHARACTER_ID: neferCharacterId } =
    await import("#src/services/kit/characters/neferKit");
  return { CharacterIdCreateKitBehaviourMap: { [neferCharacterId]: () => Promise.resolve(createNeferKitBehaviour) } };
});

describe(readCharacterKit, () => {
  // Its own record and multipliers hold none of the Traveler's values, so a kit built from them would differ
  test("a character without a kit of its own fights by the Traveler's kit", async () => {
    expect.hasAssertions();

    const [kit, travelerKit] = await Promise.all([
      readCharacterKit(GAME_DATA_LOCAL_BASE_URL, XIANGLING_CHARACTER_ID),
      readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID),
    ]);

    // Each carries its own character's icons, which the comparison leaves out
    expect({ ...kit, skillGlyphs: undefined }).toStrictEqual({ ...travelerKit, skillGlyphs: undefined });
  });

  test("reads each talent's parameters at the level given for it", async () => {
    expect.hasAssertions();
    const [startKit, raisedKit] = await Promise.all([
      readCharacterKit(GAME_DATA_LOCAL_BASE_URL, VENTI_CHARACTER_ID),
      readCharacterKit(GAME_DATA_LOCAL_BASE_URL, VENTI_CHARACTER_ID, {
        ...TALENT_START_LEVELS,
        [CombatTalent.ElementalSkill]: 13,
      }),
    ]);

    expect(takeOne(raisedKit.elementalSkill.hits).talentMultiplier).toBeGreaterThan(
      takeOne(startKit.elementalSkill.hits).talentMultiplier,
    );
    expect(takeOne(raisedKit.elementalBurst.hits).talentMultiplier).toBe(
      takeOne(startKit.elementalBurst.hits).talentMultiplier,
    );
  });

  test("a character with its own kit fights by it", async () => {
    expect.hasAssertions();

    const [kit, travelerKit] = await Promise.all([
      readCharacterKit(GAME_DATA_LOCAL_BASE_URL, NEFER_CHARACTER_ID),
      readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID),
    ]);

    // The Traveler's kit takes its wielder's element for its skill's hit, which Nefer's own module does not
    expect(kit.elementalSkill.hits.map(({ element }) => element)).not.toStrictEqual(
      travelerKit.elementalSkill.hits.map(({ element }) => element),
    );
  });

  test("carries the character's own skill and burst icons from the hosted index", async () => {
    expect.hasAssertions();

    const [kit, skillGlyphs] = await Promise.all([
      readCharacterKit(GAME_DATA_LOCAL_BASE_URL, VENTI_CHARACTER_ID),
      readGameDataEntry(
        GAME_DATA_LOCAL_BASE_URL,
        GameDataset.SkillGlyphs,
        String(VENTI_CHARACTER_ID),
        skillGlyphsSchema,
      ),
    ]);

    expect(kit.skillGlyphs).toStrictEqual(skillGlyphs);
  });
});
