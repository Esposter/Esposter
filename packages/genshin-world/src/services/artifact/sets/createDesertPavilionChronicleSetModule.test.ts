import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitStrike } from "#src/models/kit/KitStrike";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { AttackTag } from "#src/models/combat/AttackTag";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { DESERT_PAVILION_CHRONICLE_ARTIFACT_SET_ID } from "#src/services/artifact/constants";
import { createDesertPavilionChronicleSetModule } from "#src/services/artifact/sets/createDesertPavilionChronicleSetModule";
import { createSetWearer } from "#src/services/artifact/sets/createSetWearer.test";
import { getArtifactSetBonus } from "#src/services/artifact/sets/getArtifactSetBonus.test";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { readStatTables } from "#src/services/character/readStatTables";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { createKitTestContext, stepKitSeconds } from "#src/services/kit/createKitTestContext.test";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { createDeployedCombatant } from "#src/services/party/createDeployedCombatant.test";
import { createParty } from "#src/services/party/createParty";
import { describe, expect, test } from "vitest";

const statTables = await readStatTables(GAME_DATA_LOCAL_BASE_URL);
const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);

describe(createDesertPavilionChronicleSetModule, () => {
  const wearer = createSetWearer(KIT);
  const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
  const createStrike = (attackTag: AttackTag): KitStrike => ({
    attackTag,
    body: { facing: 0, height: 0, position: { x: 0, z: 0 } },
    combatant: wearer,
    hit: KIT.plungeCollision,
  });

  test("raises Normal Attack SPD by 10% and the DMG of its wearer's Normal, Charged and Plunging Attacks by 40% for 15 seconds after a Charged Attack hits, from four pieces", () => {
    expect.hasAssertions();

    const party = createParty([TRAVELER_CHARACTER_ID]);
    const kitEffectState: KitEffectState = { effects: [] };
    const context = createKitTestContext(wearer, { kitEffectState, party });
    const { getPassiveBonuses, getStrikeDamageBonus, onKitEvent } = createDesertPavilionChronicleSetModule(
      getArtifactSetBonus(statTables, DESERT_PAVILION_CHRONICLE_ARTIFACT_SET_ID, 4),
    );

    expect(getStrikeDamageBonus?.(createStrike(AttackTag.NormalAttack), enemy, party, kitEffectState.effects)).toBe(0);
    onKitEvent?.(
      {
        attackTag: AttackTag.ChargedAttack,
        enemy,
        hit: KIT.plungeCollision,
        isCritical: false,
        isDefeated: false,
        kind: KitEventKind.DamageTaken,
        striker: wearer,
      },
      context,
      wearer,
    );
    expect(
      getPassiveBonuses?.(wearer, 1, [createDeployedCombatant(wearer, { isOnField: true })], kitEffectState.effects),
    ).toStrictEqual([{ amount: 0.1, attribute: Attribute.NormalAttackSpeed }]);
    for (const attackTag of [AttackTag.NormalAttack, AttackTag.ChargedAttack, AttackTag.PlungingAttack])
      expect(getStrikeDamageBonus?.(createStrike(attackTag), enemy, party, kitEffectState.effects)).toBeCloseTo(0.4);
    expect(getStrikeDamageBonus?.(createStrike(AttackTag.ElementalSkill), enemy, party, kitEffectState.effects)).toBe(
      0,
    );

    stepKitSeconds(context, 14.5);
    expect(
      getStrikeDamageBonus?.(createStrike(AttackTag.ChargedAttack), enemy, party, kitEffectState.effects),
    ).toBeCloseTo(0.4);
    stepKitSeconds(context, 1);
    expect(getStrikeDamageBonus?.(createStrike(AttackTag.ChargedAttack), enemy, party, kitEffectState.effects)).toBe(0);
  });
});
