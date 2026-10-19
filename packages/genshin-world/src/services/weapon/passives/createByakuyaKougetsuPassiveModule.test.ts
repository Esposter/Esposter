import type { Combatant } from "#src/models/kit/Combatant";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { AttackTag } from "#src/models/combat/AttackTag";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { createKitStrike } from "#src/services/kit/createKitStrike.test";
import { createKitTestContext, stepKitSeconds } from "#src/services/kit/createKitTestContext.test";
import { buffKitMember } from "#src/services/kit/effects/buffKitMember";
import { getBuffedCombatant } from "#src/services/kit/effects/getBuffedCombatant";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { getPartyMember } from "#src/services/party/getPartyMember";
import { createByakuyaKougetsuPassiveModule } from "#src/services/weapon/passives/createByakuyaKougetsuPassiveModule";
import { createWielderCombatant } from "#src/services/weapon/passives/createWielderCombatant.test";
import { describe, expect, test } from "vitest";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const TRAVELER_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);

describe(createByakuyaKougetsuPassiveModule, () => {
  const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");

  // Byakuya Kougetsu with synthetic params: its Healing Bonus is the table's, so its first param is not read here.
  // Normal Attack DMG rises by 5% of the wielder's Max HP as base damage, and for 3 seconds after an Elemental Burst,
  // Each Normal Attack that hits restores 0.5 Energy, once every 0.5 seconds
  const byakuyaKougetsuPassiveModule = createByakuyaKougetsuPassiveModule([0, 0.05, 3, 0.5, 0.5]);
  const wielder: Combatant = createWielderCombatant();
  const burstUsed = { characterId: TRAVELER_CHARACTER_ID, energyCost: 60, kind: KitEventKind.BurstUsed as const };
  const normalAttackHit = {
    attackTag: AttackTag.NormalAttack,
    enemy,
    hit: TRAVELER_KIT.plungeCollision,
    isCritical: false,
    isDefeated: false,
    kind: KitEventKind.DamageTaken as const,
    striker: wielder,
  };

  test("a Normal Attack gains 5% of the wielder's Max HP as base damage, and a Charged Attack gains none", () => {
    expect.hasAssertions();

    const combatant: Combatant = {
      ...wielder,
      attributes: computeCharacterAttributes([{ attribute: Attribute.BaseHealth, value: 10_000 }]),
    };
    const context = createKitTestContext(combatant);
    expect(
      [AttackTag.NormalAttack, AttackTag.ChargedAttack].map((attackTag) =>
        byakuyaKougetsuPassiveModule.getStrikeAdditiveBaseDamageBonus?.(
          createKitStrike(combatant, attackTag),
          enemy,
          context.party,
          context.kitEffectState.effects,
          context.characterIdCombatantMap,
        ),
      ),
    ).toStrictEqual([0.05 * 10_000, 0]);
  });

  test("a Health buff on the wielder raises the Normal Attack's base damage through her buffed Max HP", () => {
    expect.hasAssertions();

    const combatant: Combatant = {
      ...wielder,
      attributes: computeCharacterAttributes([{ attribute: Attribute.BaseHealth, value: 10_000 }]),
    };
    const context = createKitTestContext(combatant);
    buffKitMember(context.kitEffectState, TRAVELER_CHARACTER_ID, {
      amount: 0.2,
      attribute: Attribute.HealthPercent,
      secondsRemaining: 12,
    });
    const buffedCombatant = getBuffedCombatant(
      combatant,
      context.kitEffectState.effects,
      context.party,
      context.characterIdCombatantMap,
    );

    expect(
      byakuyaKougetsuPassiveModule.getStrikeAdditiveBaseDamageBonus?.(
        createKitStrike(buffedCombatant, AttackTag.NormalAttack),
        enemy,
        context.party,
        context.kitEffectState.effects,
        context.characterIdCombatantMap,
      ),
    ).toStrictEqual(0.05 * 12_000);
  });

  test("a Normal Attack after an Elemental Burst restores 0.5 Energy", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    byakuyaKougetsuPassiveModule.onKitEvent?.(burstUsed, context, wielder);
    byakuyaKougetsuPassiveModule.onKitEvent?.(normalAttackHit, context, wielder);

    expect(getPartyMember(context.party, TRAVELER_CHARACTER_ID).energy).toBe(0.5);
  });

  test("a Normal Attack without an Elemental Burst before it restores no Energy", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    byakuyaKougetsuPassiveModule.onKitEvent?.(normalAttackHit, context, wielder);

    expect(getPartyMember(context.party, TRAVELER_CHARACTER_ID).energy).toBe(0);
  });

  test("the Energy restore ends three seconds after the Elemental Burst", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    byakuyaKougetsuPassiveModule.onKitEvent?.(burstUsed, context, wielder);
    stepKitSeconds(context, 3.1);
    byakuyaKougetsuPassiveModule.onKitEvent?.(normalAttackHit, context, wielder);

    expect(getPartyMember(context.party, TRAVELER_CHARACTER_ID).energy).toBe(0);
  });

  test("the Energy restore comes once every 0.5 seconds", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    byakuyaKougetsuPassiveModule.onKitEvent?.(burstUsed, context, wielder);
    byakuyaKougetsuPassiveModule.onKitEvent?.(normalAttackHit, context, wielder);
    byakuyaKougetsuPassiveModule.onKitEvent?.(normalAttackHit, context, wielder);
    const energyInsideCooldown = getPartyMember(context.party, TRAVELER_CHARACTER_ID).energy;
    stepKitSeconds(context, 0.6);
    byakuyaKougetsuPassiveModule.onKitEvent?.(normalAttackHit, context, wielder);

    expect([energyInsideCooldown, getPartyMember(context.party, TRAVELER_CHARACTER_ID).energy]).toStrictEqual([0.5, 1]);
  });
});
