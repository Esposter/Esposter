import type { Combatant } from "#src/models/kit/Combatant";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { ReactionType } from "#src/models/combat/ReactionType";
import { Element } from "#src/models/Element";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { WeaponType } from "#src/models/weapon/WeaponType";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { createSayuKitBehaviour, SAYU_CHARACTER_ID } from "#src/services/kit/characters/sayuKit";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { createParty } from "#src/services/party/createParty";
import { describe, expect, test } from "vitest";

const SAYU_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, SAYU_CHARACTER_ID);
const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const createSayuCombatant = (constellationCount: number): Combatant => ({
  ascension: 0,
  attributes: computeCharacterAttributes([]),
  characterId: SAYU_CHARACTER_ID,
  constellationCount,
  elementalResonances: [],
  kit: SAYU_KIT,
  level: 90,
  weaponType: WeaponType.Catalyst,
});

// The Energy Sayu holds after the same Swirl of hers lands the given number of times, with her on the field or not
const readEnergyAfterSwirls = (constellationCount: number, isOnField: boolean, times: number): number => {
  const combatant = createSayuCombatant(constellationCount);
  const other: Combatant = { ...combatant, characterId: 10_000_066 };
  const party = createParty([SAYU_CHARACTER_ID]);
  const context = createKitTestContext(combatant, { activeCombatant: isOnField ? combatant : other, party });
  const event = {
    enemy: createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, ""),
    kind: KitEventKind.ReactionTriggered as const,
    reactions: [{ element: Element.Anemo, reactionType: ReactionType.Swirl, spreadGauge: 1 }],
    striker: combatant,
  };
  for (let index = 0; index < times; index++) SAYU_KIT.onKitEvent?.(event, context, combatant);

  return party.characterIdMemberMap.get(SAYU_CHARACTER_ID)?.energy ?? 0;
};

describe(createSayuKitBehaviour, () => {
  test("a roll held for its maximum ends in a kick a little under twelve seconds past its start, on a cooldown of eleven", () => {
    expect.hasAssertions();
    const maximumRoll = SAYU_KIT.elementalSkillHolds?.at(-1);
    if (!maximumRoll) throw new Error("Sayu has no roll");
    const kick = maximumRoll.action.hits.at(-1);

    expect(kick?.hitmarkSeconds).toBeCloseTo((67 + 600) / 60);
    expect(maximumRoll.cooldownSeconds).toBeCloseTo(11);
  });

  test("a Constellation 4 Swirl of hers on the field restores 1.2 Energy to her, once every 2 seconds", () => {
    expect.hasAssertions();

    expect(readEnergyAfterSwirls(4, true, 3)).toBe(1.2);
  });

  test("a Constellation 3 switch, or a Swirl with Sayu off the field, restores no Energy", () => {
    expect.hasAssertions();

    expect([readEnergyAfterSwirls(3, true, 1), readEnergyAfterSwirls(4, false, 1)]).toStrictEqual([0, 0]);
  });
});
