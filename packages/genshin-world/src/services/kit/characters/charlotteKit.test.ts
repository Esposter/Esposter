import type { Combatant } from "#src/models/kit/Combatant";
import type { DeployedCombatant } from "#src/models/kit/DeployedCombatant";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { WeaponType } from "#src/models/weapon/WeaponType";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { CHARLOTTE_CHARACTER_ID, createCharlotteKitBehaviour } from "#src/services/kit/characters/charlotteKit";
import { createKitTestContext, stepKitSeconds } from "#src/services/kit/createKitTestContext.test";
import { buffKitMember } from "#src/services/kit/effects/buffKitMember";
import { changeKitMemberHealth } from "#src/services/kit/effects/changeKitMemberHealth";
import { stepKitEffects } from "#src/services/kit/effects/stepKitEffects";
import { stepKitTestEffects } from "#src/services/kit/effects/stepKitTestEffects.test";
import { emitKitEvent } from "#src/services/kit/emitKitEvent";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { createDeployedCombatant } from "#src/services/party/createDeployedCombatant.test";
import { createParty } from "#src/services/party/createParty";
import { getPartyMember } from "#src/services/party/getPartyMember";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const CHARLOTTE_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, CHARLOTTE_CHARACTER_ID);
const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);

describe(createCharlotteKitBehaviour, () => {
  const createCharlotteCombatant = (): Combatant => ({
    ascension: 0,
    attributes: computeCharacterAttributes([
      { attribute: Attribute.BaseHealth, value: MAX_HEALTH },
      { attribute: Attribute.BaseAttack, value: ATTACK },
    ]),
    characterId: CHARLOTTE_CHARACTER_ID,
    constellationCount: 0,
    elementalResonances: [],
    kit: CHARLOTTE_KIT,
    level: 90,
    weaponType: WeaponType.Catalyst,
  });

  const MAX_HEALTH = 10_000;
  const ATTACK = 1000;
  const THORN_HITMARK_SECONDS = 97 / 60;

  test("the charged attack's Spiritbreath Thorn strikes once, and a thorn within its six-second cooldown is not opened", () => {
    expect.hasAssertions();
    const target = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
    const context = createKitTestContext(createCharlotteCombatant());
    const castCharged = (): void => CHARLOTTE_KIT.chargedAttack.onStart?.(context, target);
    const stepThorn = (stepSeconds: number): number => stepKitTestEffects(stepSeconds, context).length;

    castCharged();
    const firstThorn = stepThorn(THORN_HITMARK_SECONDS);
    castCharged();
    const thornInCooldown = stepThorn(THORN_HITMARK_SECONDS);
    stepThorn(6);
    castCharged();
    const thornAfterCooldown = stepThorn(THORN_HITMARK_SECONDS);

    expect([firstThorn, thornInCooldown, thornAfterCooldown]).toStrictEqual([1, 0, 1]);
  });

  test("framing's press marks the first five enemies it strikes and no more", () => {
    expect.hasAssertions();
    const combatant = createCharlotteCombatant();
    const press = CHARLOTTE_KIT.elementalSkill.hits[0]?.enemyStatus;
    CHARLOTTE_KIT.elementalSkill.onStart?.(createKitTestContext(combatant));
    const marks = Array.from({ length: 6 }, () => press?.(combatant, combatant.attributes.maxHealth) !== undefined);

    expect(marks).toStrictEqual([true, true, true, true, true, false]);
  });

  test("still photo's cast heals every member of the party at its strike's frame, by its flat HP and a share of the caster's ATK", () => {
    expect.hasAssertions();
    const context = createKitTestContext(createCharlotteCombatant());
    const member = getPartyMember(context.party, CHARLOTTE_CHARACTER_ID);
    member.healthShare = 0.5;
    CHARLOTTE_KIT.elementalBurst.onStart?.(context);
    const stepBurst = (stepSeconds: number): void => {
      stepKitEffects(stepSeconds, context);
    };

    stepBurst(52 / 60);
    const beforeStrike = member.healthShare;
    stepBurst(2 / 60);

    expect(beforeStrike).toBe(0.5);
    expect(member.healthShare).toBeCloseTo(0.5 + (1608.4863 + 2.565734 * ATTACK) / MAX_HEALTH);
  });

  test("the Ascension 4 Healing Bonus and Cryo DMG Bonus count each other member by region, at 5% apiece", () => {
    expect.hasAssertions();
    const charlotte = { ...createCharlotteCombatant(), ascension: 4 };
    const team: DeployedCombatant[] = [
      createDeployedCombatant(charlotte, { isOnField: true }),
      createDeployedCombatant({ ...charlotte, characterId: 2, regionId: "fontaine" }, { isOnField: false }),
      createDeployedCombatant({ ...charlotte, characterId: 3, regionId: "mondstadt" }, { isOnField: false }),
      createDeployedCombatant({ ...charlotte, characterId: 4 }, { isOnField: false }),
    ];
    expect(CHARLOTTE_KIT.getPassiveBonuses?.(charlotte, 1, team, [])).toStrictEqual([
      { amount: 0.05, attribute: Attribute.HealingBonus },
      { amount: 0.1, attribute: Attribute.CryoDamageBonus },
    ]);
    expect(CHARLOTTE_KIT.getPassiveBonuses?.(createCharlotteCombatant(), 1, team, [])).toStrictEqual([]);
  });

  test("each of two Fontaine members adds 5% Healing Bonus, and neither adds Cryo DMG Bonus", () => {
    expect.hasAssertions();
    const charlotte = { ...createCharlotteCombatant(), ascension: 4 };
    const team: DeployedCombatant[] = [
      createDeployedCombatant(charlotte, { isOnField: true }),
      createDeployedCombatant({ ...charlotte, characterId: 2, regionId: "fontaine" }, { isOnField: false }),
      createDeployedCombatant({ ...charlotte, characterId: 3, regionId: "fontaine" }, { isOnField: false }),
    ];
    expect(CHARLOTTE_KIT.getPassiveBonuses?.(charlotte, 1, team, [])).toStrictEqual([
      { amount: 0.1, attribute: Attribute.HealingBonus },
      { amount: 0, attribute: Attribute.CryoDamageBonus },
    ]);
  });

  test("constellation 1's heals over time read Charlotte's ATK with the buffs on her as they stand at each tick, as gcsim's TotalAtk does", () => {
    expect.hasAssertions();
    const PARTNER_CHARACTER_ID = 10_000_001;
    const charlotte = { ...createCharlotteCombatant(), constellationCount: 1 };
    const partner = { ...createCharlotteCombatant(), characterId: PARTNER_CHARACTER_ID };
    const context = createKitTestContext(charlotte, {
      characterIdCombatantMap: new Map([
        [CHARLOTTE_CHARACTER_ID, charlotte],
        [PARTNER_CHARACTER_ID, partner],
      ]),
      party: createParty([CHARLOTTE_CHARACTER_ID, PARTNER_CHARACTER_ID]),
    });
    const member = getPartyMember(context.party, PARTNER_CHARACTER_ID);
    member.healthShare = 0.1;
    // Charlotte's heal lands on the partner, and the step sends the change, which starts constellation 1 and heals at once
    changeKitMemberHealth(context, charlotte, PARTNER_CHARACTER_ID, 1);
    emitKitEvent({ ...takeOne(context.party.healthChanges), kind: KitEventKind.HealthChanged }, context);
    buffKitMember(context.kitEffectState, CHARLOTTE_CHARACTER_ID, {
      amount: 1,
      attribute: Attribute.AttackPercent,
      secondsRemaining: 100,
      source: "test",
    });
    // Steps the seconds given, and returns how far the partner's health share rose over them
    const stepRaise = (seconds: number): number => {
      const healthShare = member.healthShare;
      stepKitSeconds(context, seconds);
      return member.healthShare - healthShare;
    };
    const firstTickRaise = stepRaise(2.5);
    const secondTickRaise = stepRaise(2);

    expect(firstTickRaise).toBeCloseTo(0.16);
    expect(secondTickRaise).toBeCloseTo(0.16);
  });
});
