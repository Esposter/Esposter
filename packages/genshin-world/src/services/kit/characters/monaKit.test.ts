import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEffect } from "#src/models/kit/KitEffect";
import type { KitInput } from "#src/models/kit/KitInput";
import type { KitStepContext } from "#src/models/kit/KitStepContext";

import { Attribute } from "#src/models/character/Attribute";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { MONA_CHARACTER_ID } from "#src/services/character/constants";
import { createMonaKit } from "#src/services/kit/characters/monaKit";
import { createKitState } from "#src/services/kit/createKitState";
import { getBuffedCombatant } from "#src/services/kit/effects/getBuffedCombatant";
import { stepKitEffects } from "#src/services/kit/effects/stepKitEffects";
import { readTalentMultipliers } from "#src/services/kit/readTalentMultipliers";
import { stepKit } from "#src/services/kit/stepKit";
import { createParty } from "#src/services/party/createParty";
import { createPartyMember } from "#src/services/party/createPartyMember";
import { takeOne } from "@esposter/shared";
import { createStamina, LocomotionState, STAMINA_MAX } from "genshin-engine";
import { describe, expect, test } from "vitest";

const MONA_KIT = createMonaKit(await readTalentMultipliers([MONA_CHARACTER_ID]));

const createMonaCombatant = (): Combatant => ({
  ascension: 0,
  attributes: computeCharacterAttributes([]),
  characterId: MONA_CHARACTER_ID,
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
    const effects: KitEffect[] = [];
    MONA_KIT.elementalSkill.onStart?.({ body: { facing: 0, height: 0, position: body }, combatant, effects });

    // A single step past the explosion at 329 frames lands every hit of the summon, and the summon then ends
    const strikes = stepKitEffects(effects, 6, { activeCombatant: combatant, body, party });
    expect(strikes.map(({ hit }) => hit.talentMultiplier)).toStrictEqual([0.32, 0.32, 0.32, 0.32, 1.328]);
    expect(effects).toStrictEqual([]);
  });

  test("its Stellaris Phantasm gives each enemy in its bubble an Omen of 4 seconds and 42% DMG taken", () => {
    expect.hasAssertions();
    const { enemyStatus } = takeOne(MONA_KIT.elementalBurst.hits);
    const omen = enemyStatus?.(createMonaCombatant());
    expect(omen?.id).toBe("mona-omen");
    expect(omen?.secondsRemaining).toBeCloseTo(4, 2);
    expect(omen?.damageTakenBonus).toBeCloseTo(0.42, 2);
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
      const effects: KitEffect[] = [];
      const context: KitStepContext = { body, combatant, effects };
      const kitState = createKitState();
      const partyMember = createPartyMember();
      const stamina = createStamina(STAMINA_MAX);
      // 2.17 seconds of sprint at the fixed step, past the first 2 seconds
      for (let step = 0; step < 130; step++)
        stepKit(kitState, MONA_KIT, sprint, partyMember, stamina, 1 / 60, [], context);
      return { combatant, effects };
    };

    expect(sprintFor(0).effects).toStrictEqual([]);
    const { combatant, effects } = sprintFor(1);
    expect(effects.map(({ kind }) => kind)).toStrictEqual(["summon"]);

    // The phantom's explosion lands once its 2 seconds run out, at 0.5 of the explosion's multiplier of 1.328
    const strikes = stepKitEffects(effects, 2, {
      activeCombatant: combatant,
      body: body.position,
      party: createParty([MONA_CHARACTER_ID]),
    });
    expect(strikes.map(({ hit }) => hit.talentMultiplier)).toHaveLength(1);
    expect(strikes[0]?.hit.talentMultiplier).toBeCloseTo(0.664, 3);
  });
});
