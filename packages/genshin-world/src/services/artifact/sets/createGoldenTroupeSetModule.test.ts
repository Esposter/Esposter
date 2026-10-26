import type { KitEffectState } from "#src/models/kit/KitEffectState";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { AttackTag } from "#src/models/combat/AttackTag";
import { GOLDEN_TROUPE_ARTIFACT_SET_ID } from "#src/services/artifact/constants";
import { createGoldenTroupeSetModule } from "#src/services/artifact/sets/createGoldenTroupeSetModule";
import { getArtifactSetBonus } from "#src/services/artifact/sets/getArtifactSetBonus.test";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { readStatTables } from "#src/services/character/readStatTables";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { OTHER_CHARACTER_ID } from "#src/services/kit/constants.test";
import { createCharacterSwapped } from "#src/services/kit/createCharacterSwapped.test";
import { createKitCombatant } from "#src/services/kit/createKitCombatant.test";
import { createKitStrike } from "#src/services/kit/createKitStrike.test";
import { createKitTestContext, stepKitSeconds } from "#src/services/kit/createKitTestContext.test";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { createParty } from "#src/services/party/createParty";
import { describe, expect, test } from "vitest";

const statTables = await readStatTables(GAME_DATA_LOCAL_BASE_URL);
const KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);
const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);

describe(createGoldenTroupeSetModule, () => {
  const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
  const wearer = createKitCombatant(TRAVELER_CHARACTER_ID, KIT);

  test("raises Elemental Skill DMG by 20% from two pieces, and of no other strike", () => {
    expect.hasAssertions();

    const { getStrikeDamageBonus } = createGoldenTroupeSetModule(
      getArtifactSetBonus(statTables, GOLDEN_TROUPE_ARTIFACT_SET_ID, 2),
    );
    const party = createParty([TRAVELER_CHARACTER_ID]);

    expect(getStrikeDamageBonus?.(createKitStrike(wearer, AttackTag.ElementalSkill), enemy, party, [])).toBeCloseTo(
      0.2,
    );
    expect(getStrikeDamageBonus?.(createKitStrike(wearer, AttackTag.NormalAttack), enemy, party, [])).toBe(0);
  });

  test("raises Elemental Skill DMG by 25% on the field, and by 25% more off it and for 2 seconds after taking it, from four pieces", () => {
    expect.hasAssertions();

    const { getStrikeDamageBonus, onKitEvent } = createGoldenTroupeSetModule(
      getArtifactSetBonus(statTables, GOLDEN_TROUPE_ARTIFACT_SET_ID, 4),
    );
    const onField = createParty([TRAVELER_CHARACTER_ID, OTHER_CHARACTER_ID]);
    const offField = createParty([OTHER_CHARACTER_ID, TRAVELER_CHARACTER_ID]);
    const kitEffectState: KitEffectState = { effects: [] };
    const context = createKitTestContext(wearer, { kitEffectState, party: onField });

    expect(getStrikeDamageBonus?.(createKitStrike(wearer, AttackTag.ElementalSkill), enemy, onField, [])).toBeCloseTo(
      0.25,
    );
    expect(getStrikeDamageBonus?.(createKitStrike(wearer, AttackTag.ElementalSkill), enemy, offField, [])).toBeCloseTo(
      0.5,
    );

    onKitEvent?.(createCharacterSwapped(TRAVELER_CHARACTER_ID, OTHER_CHARACTER_ID), context, wearer);
    expect(
      getStrikeDamageBonus?.(createKitStrike(wearer, AttackTag.ElementalSkill), enemy, onField, kitEffectState.effects),
    ).toBeCloseTo(0.5);

    stepKitSeconds(context, 1.5);
    expect(
      getStrikeDamageBonus?.(createKitStrike(wearer, AttackTag.ElementalSkill), enemy, onField, kitEffectState.effects),
    ).toBeCloseTo(0.5);

    stepKitSeconds(context, 1);
    expect(
      getStrikeDamageBonus?.(createKitStrike(wearer, AttackTag.ElementalSkill), enemy, onField, kitEffectState.effects),
    ).toBeCloseTo(0.25);
  });
});
