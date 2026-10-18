import type { Combatant } from "#src/models/kit/Combatant";
import type { KitStrike } from "#src/models/kit/KitStrike";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { AttackTag } from "#src/models/combat/AttackTag";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { createKitTestContext, stepKitSeconds } from "#src/services/kit/createKitTestContext.test";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { createParty } from "#src/services/party/createParty";
import { getPartyMember } from "#src/services/party/getPartyMember";
import { createSamuraiConductPassiveModule } from "#src/services/weapon/passives/createSamuraiConductPassiveModule";
import { describe, expect, test } from "vitest";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const TRAVELER_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);

describe(createSamuraiConductPassiveModule, () => {
  // Samurai Conduct at its fifth rank: twelve per cent Elemental Skill DMG, three energy spent, five regenerated on each
  // Two-second tick for six seconds, and a ten-second cooldown
  const samuraiConductPassiveModule = createSamuraiConductPassiveModule([0.12, 3, 5, 6, 10]);
  const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
  const wielder: Combatant = {
    ascension: 0,
    attributes: computeCharacterAttributes([]),
    characterId: TRAVELER_CHARACTER_ID,
    constellationCount: 0,
    elementalResonances: [],
    kit: TRAVELER_KIT,
    level: 1,
  };
  const createStrike = (attackTag: AttackTag): KitStrike => ({
    attackTag,
    body: { facing: 0, height: 0, position: { x: 0, z: 0 } },
    combatant: wielder,
    hit: TRAVELER_KIT.plungeCollision,
  });
  const createDamageTaken = (attackTag: AttackTag) => ({
    attackTag,
    enemy,
    hit: TRAVELER_KIT.plungeCollision,
    isCritical: false,
    isDefeated: false,
    kind: KitEventKind.DamageTaken as const,
    striker: wielder,
  });

  test("an Elemental Skill is raised by the rank's percentage of DMG and a normal attack is not", () => {
    expect.hasAssertions();

    const party = createParty([TRAVELER_CHARACTER_ID]);
    expect(
      samuraiConductPassiveModule.getStrikeDamageBonus?.(createStrike(AttackTag.ElementalSkill), enemy, party, []),
    ).toBe(0.12);
    expect(
      samuraiConductPassiveModule.getStrikeDamageBonus?.(createStrike(AttackTag.NormalAttack), enemy, party, []),
    ).toBe(0);
  });

  test("an Elemental Skill hit spends the rank's energy and regenerates the rank's energy on each two-second tick", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    getPartyMember(context.party, TRAVELER_CHARACTER_ID).energy = 10;
    samuraiConductPassiveModule.onKitEvent?.(createDamageTaken(AttackTag.ElementalSkill), context, wielder);

    expect(getPartyMember(context.party, TRAVELER_CHARACTER_ID).energy).toBe(7);

    stepKitSeconds(context, 6.1);

    expect(getPartyMember(context.party, TRAVELER_CHARACTER_ID).energy).toBe(22);
  });

  test("a second Elemental Skill hit inside the cooldown spends and regenerates nothing", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    getPartyMember(context.party, TRAVELER_CHARACTER_ID).energy = 10;
    samuraiConductPassiveModule.onKitEvent?.(createDamageTaken(AttackTag.ElementalSkill), context, wielder);
    samuraiConductPassiveModule.onKitEvent?.(createDamageTaken(AttackTag.ElementalSkill), context, wielder);

    stepKitSeconds(context, 6.1);

    expect(getPartyMember(context.party, TRAVELER_CHARACTER_ID).energy).toBe(22);
  });

  test("a normal attack hit spends and regenerates nothing", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    getPartyMember(context.party, TRAVELER_CHARACTER_ID).energy = 10;
    samuraiConductPassiveModule.onKitEvent?.(createDamageTaken(AttackTag.NormalAttack), context, wielder);

    stepKitSeconds(context, 6.1);

    expect(getPartyMember(context.party, TRAVELER_CHARACTER_ID).energy).toBe(10);
  });
});
