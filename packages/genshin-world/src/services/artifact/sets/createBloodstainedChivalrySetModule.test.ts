import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitStrike } from "#src/models/kit/KitStrike";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { AttackTag } from "#src/models/combat/AttackTag";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { BLOODSTAINED_CHIVALRY_ARTIFACT_SET_ID } from "#src/services/artifact/constants";
import { createBloodstainedChivalrySetModule } from "#src/services/artifact/sets/createBloodstainedChivalrySetModule";
import { createSetWearer } from "#src/services/artifact/sets/createSetWearer.test";
import { getArtifactSetBonus } from "#src/services/artifact/sets/getArtifactSetBonus.test";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { readStatTables } from "#src/services/character/readStatTables";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { createParty } from "#src/services/party/createParty";
import { describe, expect, test } from "vitest";

const statTables = await readStatTables(GAME_DATA_LOCAL_BASE_URL);
const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);
const wearer = createSetWearer(KIT);
const OTHER_CHARACTER_ID = 2;
const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
const createStrike = (attackTag: AttackTag): KitStrike => ({
  attackTag,
  body: { facing: 0, height: 0, position: { x: 0, z: 0 } },
  combatant: wearer,
  hit: KIT.plungeCollision,
});

describe(createBloodstainedChivalrySetModule, () => {
  test("raises the DMG of its wearer's Charged Attacks by 50% once it defeats an opponent, and of no other strike", () => {
    expect.hasAssertions();

    const party = createParty([TRAVELER_CHARACTER_ID]);
    const kitEffectState: KitEffectState = { effects: [] };
    const context = createKitTestContext(wearer, { kitEffectState, party });
    const { getStrikeDamageBonus, onKitEvent } = createBloodstainedChivalrySetModule(
      getArtifactSetBonus(statTables, BLOODSTAINED_CHIVALRY_ARTIFACT_SET_ID, 4),
    );

    expect(getStrikeDamageBonus?.(createStrike(AttackTag.ChargedAttack), enemy, party, kitEffectState.effects)).toBe(0);
    onKitEvent?.({ enemy, kind: KitEventKind.EnemyDefeated, striker: wearer }, context, wearer);
    expect(getStrikeDamageBonus?.(createStrike(AttackTag.ChargedAttack), enemy, party, kitEffectState.effects)).toBe(
      0.5,
    );
    expect(getStrikeDamageBonus?.(createStrike(AttackTag.NormalAttack), enemy, party, kitEffectState.effects)).toBe(0);
  });

  test("costs its wearer's Charged Attacks no stamina while the bonus stands, and keeps the cost otherwise", () => {
    expect.hasAssertions();

    const party = createParty([TRAVELER_CHARACTER_ID]);
    const kitEffectState: KitEffectState = { effects: [] };
    const context = createKitTestContext(wearer, { kitEffectState, party });
    const { getChargedAttackStaminaMultiplier, onKitEvent } = createBloodstainedChivalrySetModule(
      getArtifactSetBonus(statTables, BLOODSTAINED_CHIVALRY_ARTIFACT_SET_ID, 4),
    );

    expect(getChargedAttackStaminaMultiplier?.(context)).toBe(1);
    onKitEvent?.({ enemy, kind: KitEventKind.EnemyDefeated, striker: wearer }, context, wearer);
    expect(getChargedAttackStaminaMultiplier?.(context)).toBe(0);
  });

  test("cuts only its wearer's Charged Attacks, so a teammate's keeps its cost while the bonus stands", () => {
    expect.hasAssertions();

    const party = createParty([TRAVELER_CHARACTER_ID, OTHER_CHARACTER_ID]);
    const kitEffectState: KitEffectState = { effects: [] };
    const wearerContext = createKitTestContext(wearer, { kitEffectState, party });
    const teammate: Combatant = { ...wearer, characterId: OTHER_CHARACTER_ID };
    const teammateContext = createKitTestContext(teammate, {
      kitEffectState,
      party: createParty([OTHER_CHARACTER_ID, TRAVELER_CHARACTER_ID]),
    });
    const { getChargedAttackStaminaMultiplier, onKitEvent } = createBloodstainedChivalrySetModule(
      getArtifactSetBonus(statTables, BLOODSTAINED_CHIVALRY_ARTIFACT_SET_ID, 4),
    );

    onKitEvent?.({ enemy, kind: KitEventKind.EnemyDefeated, striker: wearer }, wearerContext, wearer);
    expect(getChargedAttackStaminaMultiplier?.(wearerContext)).toBe(0);
    expect(getChargedAttackStaminaMultiplier?.(teammateContext)).toBe(1);
  });

  test("starts the bonus only on a defeat its wearer deals while it is the active character, and a swap off the field keeps it", () => {
    expect.hasAssertions();

    const { getStrikeDamageBonus, onKitEvent } = createBloodstainedChivalrySetModule(
      getArtifactSetBonus(statTables, BLOODSTAINED_CHIVALRY_ARTIFACT_SET_ID, 4),
    );
    const benchParty = createParty([OTHER_CHARACTER_ID, TRAVELER_CHARACTER_ID]);
    const benchKitEffectState: KitEffectState = { effects: [] };
    const benchContext = createKitTestContext(wearer, { kitEffectState: benchKitEffectState, party: benchParty });

    onKitEvent?.({ enemy, kind: KitEventKind.EnemyDefeated, striker: wearer }, benchContext, wearer);
    expect(
      getStrikeDamageBonus?.(createStrike(AttackTag.ChargedAttack), enemy, benchParty, benchKitEffectState.effects),
    ).toBe(0);

    const party = createParty([TRAVELER_CHARACTER_ID, OTHER_CHARACTER_ID]);
    const kitEffectState: KitEffectState = { effects: [] };
    const context = createKitTestContext(wearer, { kitEffectState, party });
    const charged = createStrike(AttackTag.ChargedAttack);

    onKitEvent?.({ enemy, kind: KitEventKind.EnemyDefeated, striker: undefined }, context, wearer);
    expect(getStrikeDamageBonus?.(charged, enemy, party, kitEffectState.effects)).toBe(0);
    onKitEvent?.({ enemy, kind: KitEventKind.EnemyDefeated, striker: wearer }, context, wearer);
    expect(getStrikeDamageBonus?.(charged, enemy, party, kitEffectState.effects)).toBe(0.5);
    onKitEvent?.(
      {
        characterId: OTHER_CHARACTER_ID,
        kind: KitEventKind.CharacterSwapped,
        previousCharacterId: TRAVELER_CHARACTER_ID,
      },
      context,
      wearer,
    );
    expect(getStrikeDamageBonus?.(charged, enemy, party, kitEffectState.effects)).toBe(0.5);
  });
});
