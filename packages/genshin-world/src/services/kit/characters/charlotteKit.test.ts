import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitStepContext } from "#src/models/kit/KitStepContext";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { WeaponType } from "#src/models/weapon/WeaponType";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { CHARLOTTE_CHARACTER_ID, createCharlotteKit } from "#src/services/kit/characters/charlotteKit";
import { stepKitEffects } from "#src/services/kit/effects/stepKitEffects";
import { readTalentMultipliers } from "#src/services/kit/readTalentMultipliers";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { createParty } from "#src/services/party/createParty";
import { describe, expect, test } from "vitest";

const CHARLOTTE_KIT = createCharlotteKit(
  await readTalentMultipliers(GAME_DATA_LOCAL_BASE_URL, [CHARLOTTE_CHARACTER_ID]),
);
const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const MAX_HEALTH = 10_000;
const ATTACK = 1000;
const THORN_HITMARK_SECONDS = 97 / 60;
const body = { facing: 0, height: 0, position: { x: 0, z: 0 } };

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

describe(createCharlotteKit, () => {
  test("the charged attack's Spiritbreath Thorn strikes once, and a thorn within its six-second cooldown is not opened", () => {
    expect.hasAssertions();
    const combatant = createCharlotteCombatant();
    const party = createParty([CHARLOTTE_CHARACTER_ID]);
    const target = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
    const kitEffectState: KitEffectState = { effects: [] };
    const context: KitStepContext = { body, combatant, kitEffectState, party };
    const castCharged = (): void => CHARLOTTE_KIT.chargedAttack.onStart?.({ ...context, target });
    const stepThorn = (stepSeconds: number): number =>
      stepKitEffects(kitEffectState, stepSeconds, {
        activeCombatant: combatant,
        body: body.position,
        characterIdCombatantMap: new Map([[CHARLOTTE_CHARACTER_ID, combatant]]),
        party,
      }).length;

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
    CHARLOTTE_KIT.elementalSkill.onStart?.({
      body,
      combatant,
      kitEffectState: { effects: [] },
      party: createParty([CHARLOTTE_CHARACTER_ID]),
    });
    const marks = Array.from({ length: 6 }, () => press?.(combatant) !== undefined);

    expect(marks).toStrictEqual([true, true, true, true, true, false]);
  });

  test("still photo's cast heals every member of the party at its strike's frame, by its flat HP and a share of the caster's ATK", () => {
    expect.hasAssertions();
    const combatant = createCharlotteCombatant();
    const party = createParty([CHARLOTTE_CHARACTER_ID]);
    const member = party.characterIdMemberMap.get(CHARLOTTE_CHARACTER_ID);
    if (!member) throw new Error("Charlotte is not in her party");
    member.healthShare = 0.5;
    const kitEffectState: KitEffectState = { effects: [] };
    CHARLOTTE_KIT.elementalBurst.onStart?.({ body, combatant, kitEffectState, party });
    const characterIdCombatantMap = new Map([[CHARLOTTE_CHARACTER_ID, combatant]]);
    const stepBurst = (stepSeconds: number): void => {
      stepKitEffects(kitEffectState, stepSeconds, {
        activeCombatant: combatant,
        body: body.position,
        characterIdCombatantMap,
        party,
      });
    };

    stepBurst(52 / 60);
    const beforeStrike = member.healthShare;
    stepBurst(2 / 60);

    expect(beforeStrike).toBe(0.5);
    expect(member.healthShare).toBeCloseTo(0.5 + (1608.4863 + 2.565734 * ATTACK) / MAX_HEALTH);
  });
});
