import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitStrike } from "#src/models/kit/KitStrike";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";

import { AttackTag } from "#src/models/combat/AttackTag";

import { KitEventKind } from "#src/models/kit/KitEventKind";

import { FINALE_OF_THE_DEEP_GALLERIES_ARTIFACT_SET_ID } from "#src/services/artifact/constants";
import { createFinaleOfTheDeepGalleriesSetModule } from "#src/services/artifact/sets/createFinaleOfTheDeepGalleriesSetModule";
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
import { getPartyMember } from "#src/services/party/getPartyMember";
import { describe, expect, test } from "vitest";

const statTables = await readStatTables(GAME_DATA_LOCAL_BASE_URL);
const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);
const wearer = createSetWearer(KIT);
const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
const createStrike = (attackTag: AttackTag): KitStrike => ({
  attackTag,
  body: { facing: 0, height: 0, position: { x: 0, z: 0 } },
  combatant: wearer,
  hit: KIT.plungeCollision,
});
const damageDealtBy = (attackTag: AttackTag) =>
  ({
    attackTag,
    enemy,
    hit: KIT.plungeCollision,
    isCritical: false,
    isDefeated: false,
    kind: KitEventKind.DamageTaken,
    striker: wearer,
  }) as const;

describe(createFinaleOfTheDeepGalleriesSetModule, () => {
  test("raises Normal Attack and Elemental Burst DMG by 60% each while its wearer has no Elemental Energy, from four pieces", () => {
    expect.hasAssertions();

    const party = createParty([TRAVELER_CHARACTER_ID]);
    const { getStrikeDamageBonus } = createFinaleOfTheDeepGalleriesSetModule(
      getArtifactSetBonus(statTables, FINALE_OF_THE_DEEP_GALLERIES_ARTIFACT_SET_ID, 4),
    );

    getPartyMember(party, TRAVELER_CHARACTER_ID).energy = 0;
    expect(getStrikeDamageBonus?.(createStrike(AttackTag.NormalAttack), enemy, party, [])).toBeCloseTo(0.6);
    expect(getStrikeDamageBonus?.(createStrike(AttackTag.ElementalBurst), enemy, party, [])).toBeCloseTo(0.6);
    getPartyMember(party, TRAVELER_CHARACTER_ID).energy = 10;
    expect(getStrikeDamageBonus?.(createStrike(AttackTag.NormalAttack), enemy, party, [])).toBe(0);
  });

  test("stops the Elemental Burst bonus for 6 seconds after a Normal Attack deals DMG, and the Normal Attack bonus after a burst does", () => {
    expect.hasAssertions();

    const party = createParty([TRAVELER_CHARACTER_ID]);
    const kitEffectState: KitEffectState = { effects: [] };
    const context = createKitTestContext(wearer, { kitEffectState, party });
    const { getStrikeDamageBonus, onKitEvent } = createFinaleOfTheDeepGalleriesSetModule(
      getArtifactSetBonus(statTables, FINALE_OF_THE_DEEP_GALLERIES_ARTIFACT_SET_ID, 4),
    );

    getPartyMember(party, TRAVELER_CHARACTER_ID).energy = 0;
    onKitEvent?.(damageDealtBy(AttackTag.NormalAttack), context, wearer);
    expect(getStrikeDamageBonus?.(createStrike(AttackTag.ElementalBurst), enemy, party, kitEffectState.effects)).toBe(
      0,
    );
    expect(
      getStrikeDamageBonus?.(createStrike(AttackTag.NormalAttack), enemy, party, kitEffectState.effects),
    ).toBeCloseTo(0.6);

    onKitEvent?.(damageDealtBy(AttackTag.ElementalBurst), context, wearer);
    expect(getStrikeDamageBonus?.(createStrike(AttackTag.NormalAttack), enemy, party, kitEffectState.effects)).toBe(0);
  });
});
