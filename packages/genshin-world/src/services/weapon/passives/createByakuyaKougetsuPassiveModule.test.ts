import type { Combatant } from "#src/models/kit/Combatant";
import type { KitStrike } from "#src/models/kit/KitStrike";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { AttackTag } from "#src/models/combat/AttackTag";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { createKitTestContext, stepKitSeconds } from "#src/services/kit/createKitTestContext.test";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { getPartyMember } from "#src/services/party/getPartyMember";
import { createByakuyaKougetsuPassiveModule } from "#src/services/weapon/passives/createByakuyaKougetsuPassiveModule";
import { describe, expect, test } from "vitest";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
const TRAVELER_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);

describe(createByakuyaKougetsuPassiveModule, () => {
  // Byakuya Kougetsu at its first rank: its Healing Bonus is the table's. Normal Attack DMG rises by 1% of the wielder's
  // Max HP as base damage, and for 12 seconds after an Elemental Burst, each Normal Attack that hits restores 0.6 Energy,
  // Once every 0.1 seconds
  const byakuyaKougetsuPassiveModule = createByakuyaKougetsuPassiveModule([0.1, 0.01, 12, 0.6, 0.1]);
  const wielder: Combatant = {
    ascension: 0,
    attributes: computeCharacterAttributes([]),
    characterId: TRAVELER_CHARACTER_ID,
    constellationCount: 0,
    elementalResonances: [],
    kit: TRAVELER_KIT,
    level: 1,
  };
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
  const createStrike = (attackTag: AttackTag): KitStrike => ({
    attackTag,
    body: { facing: 0, height: 0, position: { x: 0, z: 0 } },
    combatant: wielder,
    hit: TRAVELER_KIT.plungeCollision,
  });

  test("a Normal Attack gains 1% of the wielder's Max HP as base damage, and a Charged Attack gains none", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    expect(
      [AttackTag.NormalAttack, AttackTag.ChargedAttack].map((attackTag) =>
        byakuyaKougetsuPassiveModule.getStrikeAdditiveBaseDamageBonus?.(
          createStrike(attackTag),
          enemy,
          context.party,
          context.kitEffectState.effects,
          context.characterIdCombatantMap,
        ),
      ),
    ).toStrictEqual([0.01 * wielder.attributes.attributeTotalMap[Attribute.Health], 0]);
  });

  test("a Normal Attack after an Elemental Burst restores 0.6 Energy", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    byakuyaKougetsuPassiveModule.onKitEvent?.(burstUsed, context, wielder);
    byakuyaKougetsuPassiveModule.onKitEvent?.(normalAttackHit, context, wielder);

    expect(getPartyMember(context.party, TRAVELER_CHARACTER_ID).energy).toBe(0.6);
  });

  test("a Normal Attack without an Elemental Burst before it restores no Energy", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    byakuyaKougetsuPassiveModule.onKitEvent?.(normalAttackHit, context, wielder);

    expect(getPartyMember(context.party, TRAVELER_CHARACTER_ID).energy).toBe(0);
  });

  test("the Energy restore ends twelve seconds after the Elemental Burst", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    byakuyaKougetsuPassiveModule.onKitEvent?.(burstUsed, context, wielder);
    stepKitSeconds(context, 12.1);
    byakuyaKougetsuPassiveModule.onKitEvent?.(normalAttackHit, context, wielder);

    expect(getPartyMember(context.party, TRAVELER_CHARACTER_ID).energy).toBe(0);
  });

  test("the Energy restore comes once every 0.1 seconds", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    byakuyaKougetsuPassiveModule.onKitEvent?.(burstUsed, context, wielder);
    byakuyaKougetsuPassiveModule.onKitEvent?.(normalAttackHit, context, wielder);
    byakuyaKougetsuPassiveModule.onKitEvent?.(normalAttackHit, context, wielder);
    const energyInsideCooldown = getPartyMember(context.party, TRAVELER_CHARACTER_ID).energy;
    stepKitSeconds(context, 0.3);
    byakuyaKougetsuPassiveModule.onKitEvent?.(normalAttackHit, context, wielder);

    expect([energyInsideCooldown, getPartyMember(context.party, TRAVELER_CHARACTER_ID).energy]).toStrictEqual([
      0.6, 1.2,
    ]);
  });
});
