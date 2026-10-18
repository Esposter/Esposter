import type { Combatant } from "#src/models/kit/Combatant";
import type { KitContext } from "#src/models/kit/KitContext";
import type { KitSummon } from "#src/models/kit/KitSummon";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
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
import { getPartyMember } from "#src/services/party/getPartyMember";
import { describe, expect, test } from "vitest";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const SAYU_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, SAYU_CHARACTER_ID);
const createSayuCombatant = (ascension: number, constellationCount = 0): Combatant => ({
  ascension,
  attributes: computeCharacterAttributes([
    { attribute: Attribute.BaseHealth, value: 10_000 },
    { attribute: Attribute.ElementalMastery, value: 100 },
  ]),
  characterId: SAYU_CHARACTER_ID,
  constellationCount,
  elementalResonances: [],
  kit: SAYU_KIT,
  level: 90,
  weaponType: WeaponType.Catalyst,
});

// A Swirl that Sayu triggers while she is on the field, as the kit hears it
const triggerSwirl = (combatant: Combatant, context: KitContext): void =>
  SAYU_KIT.onKitEvent?.(
    {
      enemy: createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, ""),
      kind: KitEventKind.ReactionTriggered,
      reactions: [{ reactionType: ReactionType.Swirl }],
      striker: combatant,
    },
    context,
    combatant,
  );

// The reach of each Muji-Muji Daruma tick as Sayu casts the burst at the given ascension
const getDarumaRadii = (ascension: number): number[] => {
  const context = createKitTestContext(createSayuCombatant(ascension));
  SAYU_KIT.elementalBurst.onStart?.(context);
  const summon = context.kitEffectState.effects.find((effect): effect is KitSummon => effect.kind === "summon");
  return summon?.hits.map((hit) => hit.hitArea.radius) ?? [];
};

// The Energy Sayu holds after the same Swirl of hers lands the given number of times, with her on the field or not
const readEnergyAfterSwirls = (constellationCount: number, isOnField: boolean, times: number): number => {
  const combatant = createSayuCombatant(0, constellationCount);
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

  test("a passive takes effect at its ascension phase", () => {
    expect.hasAssertions();
    // Ascension 1: a Swirl Sayu triggers while on the field heals the active character by 300 and 1.2 Elemental Mastery,
    // Once every 2 seconds, and Ascension 4's Daruma ticks strike within 3.5 metres
    const combatant = createSayuCombatant(1);
    const context = createKitTestContext(combatant);
    getPartyMember(context.party, SAYU_CHARACTER_ID).healthShare = 0.5;
    triggerSwirl(combatant, context);
    triggerSwirl(combatant, context);

    expect(getPartyMember(context.party, SAYU_CHARACTER_ID).healthShare).toBeCloseTo(0.5 + (300 + 1.2 * 100) / 10_000);
    const radii = getDarumaRadii(4);
    expect(radii.length).toBeGreaterThan(0);
    expect(new Set(radii)).toStrictEqual(new Set([3.5]));
  });

  test("a passive does not take effect below its ascension phase", () => {
    expect.hasAssertions();
    // Below Ascension 1 a Swirl heals nothing, and below Ascension 4 the Daruma's ticks keep the reach they had
    const combatant = createSayuCombatant(0);
    const context = createKitTestContext(combatant);
    getPartyMember(context.party, SAYU_CHARACTER_ID).healthShare = 0.5;
    triggerSwirl(combatant, context);

    expect(getPartyMember(context.party, SAYU_CHARACTER_ID).healthShare).toBe(0.5);
    expect(getDarumaRadii(3)).toStrictEqual(getDarumaRadii(0));
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
