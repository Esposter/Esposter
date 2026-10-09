import type { Enemy } from "#src/models/enemy/Enemy";
import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitInput } from "#src/models/kit/KitInput";
import type { KitStepContext } from "#src/models/kit/KitStepContext";

import { Attribute } from "#src/models/character/Attribute";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { MONA_CHARACTER_ID } from "#src/services/character/constants";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { createMonaKit } from "#src/services/kit/characters/monaKit";
import { createKitState } from "#src/services/kit/createKitState";
import { getBuffedCombatant } from "#src/services/kit/effects/getBuffedCombatant";
import { stepKitEffects } from "#src/services/kit/effects/stepKitEffects";
import { strikeKitBubble } from "#src/services/kit/effects/strikeKitBubble";
import { readTalentMultipliers } from "#src/services/kit/readTalentMultipliers";
import { stepKit } from "#src/services/kit/stepKit";
import { strikeEnemy } from "#src/services/kit/strikeEnemy";
import { createParty } from "#src/services/party/createParty";
import { createPartyMember } from "#src/services/party/createPartyMember";
import { takeOne } from "@esposter/shared";
import { createStamina, LocomotionState, STAMINA_MAX } from "genshin-engine";
import { describe, expect, test } from "vitest";

const MONA_KIT = createMonaKit(await readTalentMultipliers([MONA_CHARACTER_ID]));

const NEVER_CRITICAL = (): number => 1;

const createSturdyEnemy = (): Enemy => ({ ...createEnemy(ENEMY_CAMP_MEMBER, ""), health: 1e9, maxHealth: 1e9 });

const createMonaCombatant = (): Combatant => ({
  ascension: 0,
  attributes: computeCharacterAttributes([]),
  characterId: MONA_CHARACTER_ID,
  constellationCount: 0,
  elementalResonances: [],
  kit: MONA_KIT,
  level: 90,
});

describe("mona kit", () => {
  test("reads each talent multiplier from its proud skill groups, to the wiki's two decimal places", () => {
    expect.hasAssertions();
    const multipliers = [
      ...MONA_KIT.normalAttacks.map((action) => takeOne(action.hits).talentMultiplier),
      takeOne(MONA_KIT.chargedAttack.hits).talentMultiplier,
      MONA_KIT.plungeCollision.talentMultiplier,
      takeOne(MONA_KIT.lowPlunge.hits).talentMultiplier,
      takeOne(MONA_KIT.highPlunge.hits).talentMultiplier,
    ];
    const expectedMultipliers = [0.376, 0.36, 0.448, 0.5616, 1.4972, 0.5683, 1.1363, 1.4193];
    expect(multipliers).toHaveLength(expectedMultipliers.length);
    for (const [index, expectedMultiplier] of expectedMultipliers.entries())
      expect(multipliers[index]).toBeCloseTo(expectedMultiplier, 2);
  });

  test("its Mirror Reflection lands four ticks and then its explosion, and ends with the explosion", () => {
    expect.hasAssertions();
    const combatant = createMonaCombatant();
    const party = createParty([MONA_CHARACTER_ID]);
    const body = { x: 0, z: 0 };
    const kitEffectState: KitEffectState = { effects: [] };
    MONA_KIT.elementalSkill.onStart?.({ body: { facing: 0, height: 0, position: body }, combatant, kitEffectState });

    // A single step past the explosion at 329 frames lands every hit of the summon, and the summon then ends
    const strikes = stepKitEffects(kitEffectState, 6, { activeCombatant: combatant, body, party });
    expect(strikes.map(({ hit }) => hit.talentMultiplier)).toStrictEqual([0.32, 0.32, 0.32, 0.32, 1.328]);
    expect(kitEffectState.effects).toStrictEqual([]);
  });

  test("ascension 4 adds 20% of its Energy Recharge to its Hydro DMG Bonus as its hits are priced", () => {
    expect.hasAssertions();
    const combatant = createMonaCombatant();
    const energyRecharge = combatant.attributes.attributeTotalMap[Attribute.EnergyRecharge];
    const pricedAsCharacter = getBuffedCombatant({ ...combatant, ascension: 4 }, []);
    expect(pricedAsCharacter.attributes.attributeTotalMap[Attribute.HydroDamageBonus]).toBeCloseTo(
      0.2 * energyRecharge,
      5,
    );
    expect(getBuffedCombatant(combatant, [])).toBe(combatant);
  });

  test("ascension 1 casts a phantom for every 2 seconds of sprint, which explodes at half of Mirror Reflection's", () => {
    expect.hasAssertions();
    const body = { facing: 0, height: 0, position: { x: 0, z: 0 } };
    const sprint: KitInput = {
      height: 0,
      isAttackHeld: false,
      isAttackPressed: false,
      isBurstPressed: false,
      isSkillHeld: false,
      isSkillPressed: false,
      locomotionState: LocomotionState.Sprint,
    };
    const sprintFor = (ascension: number) => {
      const combatant = { ...createMonaCombatant(), ascension };
      const kitEffectState: KitEffectState = { effects: [] };
      const context: KitStepContext = { body, combatant, kitEffectState };
      const kitState = createKitState();
      const partyMember = createPartyMember();
      const stamina = createStamina(STAMINA_MAX);
      // 2.17 seconds of sprint at the fixed step, past the first 2 seconds
      for (let step = 0; step < 130; step++)
        stepKit(kitState, MONA_KIT, sprint, partyMember, stamina, 1 / 60, [], context);
      return { combatant, kitEffectState };
    };

    expect(sprintFor(0).kitEffectState.effects).toStrictEqual([]);
    const { combatant, kitEffectState } = sprintFor(1);
    expect(kitEffectState.effects.map(({ kind }) => kind)).toStrictEqual(["summon"]);

    // The phantom's explosion lands once its 2 seconds run out, at 0.5 of the explosion's multiplier of 1.328
    const strikes = stepKitEffects(kitEffectState, 2, {
      activeCombatant: combatant,
      body: body.position,
      party: createParty([MONA_CHARACTER_ID]),
    });
    expect(strikes.map(({ hit }) => hit.talentMultiplier)).toHaveLength(1);
    expect(strikes[0]?.hit.talentMultiplier).toBeCloseTo(0.664, 3);
  });

  test("holds each enemy its Stellaris Phantasm strikes in a bubble, with no Omen on it until the bubble bursts", () => {
    expect.hasAssertions();
    const combatant = createMonaCombatant();
    const kitEffectState: KitEffectState = { effects: [] };
    const enemy = createSturdyEnemy();
    strikeKitBubble(kitEffectState, enemy, combatant, takeOne(MONA_KIT.elementalBurst.hits));

    expect(kitEffectState.effects.map(({ kind }) => kind)).toStrictEqual(["bubble"]);
    expect(enemy.statuses).toStrictEqual([]);
  });

  test("bursts its bubble on a hit with poise damage, the Omen running from the burst and the explosion on that enemy alone", () => {
    expect.hasAssertions();
    const combatant = createMonaCombatant();
    const kitEffectState: KitEffectState = { effects: [] };
    const enemy = createSturdyEnemy();
    strikeKitBubble(kitEffectState, enemy, combatant, takeOne(MONA_KIT.elementalBurst.hits));
    const poiseHit = MONA_KIT.plungeCollision;
    strikeEnemy(enemy, poiseHit, combatant, NEVER_CRITICAL);
    strikeKitBubble(kitEffectState, enemy, combatant, poiseHit);

    // The Omen's 4 seconds and 42% DMG taken, from the burst at index 3 and 9 of the burst group
    expect(enemy.statuses).toStrictEqual([{ damageTakenBonus: 0.42, id: "mona-omen", secondsRemaining: 4 }]);
    const strikes = stepKitEffects(kitEffectState, 0.5, {
      activeCombatant: combatant,
      body: { x: 0, z: 0 },
      party: createParty([MONA_CHARACTER_ID]),
    });
    expect(strikes.map(({ target }) => target)).toStrictEqual([enemy]);
    expect(strikes[0]?.hit.talentMultiplier).toBeCloseTo(4.424, 3);
    expect(kitEffectState.effects).toStrictEqual([]);
  });

  test("bursts its bubble when its 8 seconds run out, and the Omen runs from then", () => {
    expect.hasAssertions();
    const combatant = createMonaCombatant();
    const kitEffectState: KitEffectState = { effects: [] };
    const enemy = createSturdyEnemy();
    strikeKitBubble(kitEffectState, enemy, combatant, takeOne(MONA_KIT.elementalBurst.hits));
    const party = createParty([MONA_CHARACTER_ID]);

    expect(
      stepKitEffects(kitEffectState, 7.9, { activeCombatant: combatant, body: { x: 0, z: 0 }, party }),
    ).toStrictEqual([]);
    expect(enemy.statuses).toStrictEqual([]);
    const strikes = stepKitEffects(kitEffectState, 0.2, { activeCombatant: combatant, body: { x: 0, z: 0 }, party });
    expect(strikes.map(({ target }) => target)).toStrictEqual([enemy]);
    expect(enemy.statuses.map(({ secondsRemaining }) => secondsRemaining)).toStrictEqual([4]);
  });
});
