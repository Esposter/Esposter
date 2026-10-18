import type { Combatant } from "#src/models/kit/Combatant";
import type { KitStrike } from "#src/models/kit/KitStrike";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { AttackTag } from "#src/models/combat/AttackTag";
import { Attribute } from "#src/models/character/Attribute";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { damagePartyMember } from "#src/services/party/damagePartyMember";
import { getPartyMember } from "#src/services/party/getPartyMember";
import { createJusticePassiveModule } from "#src/services/weapon/passives/createJusticePassiveModule";
import { describe, expect, test } from "vitest";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const TRAVELER_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);
const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
const wielder: Combatant = {
  ascension: 0,
  attributes: computeCharacterAttributes([{ attribute: Attribute.Health, value: 1000 }]),
  characterId: TRAVELER_CHARACTER_ID,
  constellationCount: 0,
  elementalResonances: [],
  kit: TRAVELER_KIT,
  level: 1,
};
// Justice at its first rank: twenty per cent DMG for normal and charged attacks, sixty per cent of ATK as HP on a critical
// Hit, and a cooldown of five seconds
const justicePassiveModule = createJusticePassiveModule([0.2, 0.6, 5]);
const createStrike = (attackTag: AttackTag): KitStrike => ({
  attackTag,
  body: { facing: 0, height: 0, position: { x: 0, z: 0 } },
  combatant: wielder,
  hit: TRAVELER_KIT.plungeCollision,
});
const createDamageTaken = (attackTag: AttackTag, isCritical: boolean) => ({
  attackTag,
  enemy,
  hit: TRAVELER_KIT.plungeCollision,
  isCritical,
  isDefeated: false,
  kind: KitEventKind.DamageTaken as const,
  striker: wielder,
});

describe(createJusticePassiveModule, () => {
  test("normal and charged attacks deal the rank's DMG bonus and no other attack does", () => {
    expect.hasAssertions();

    const { party } = createKitTestContext(wielder);

    expect(
      justicePassiveModule.getStrikeDamageBonus?.(createStrike(AttackTag.NormalAttack), enemy, party, []),
    ).toBeCloseTo(0.2);
    expect(
      justicePassiveModule.getStrikeDamageBonus?.(createStrike(AttackTag.ChargedAttack), enemy, party, []),
    ).toBeCloseTo(0.2);
    expect(justicePassiveModule.getStrikeDamageBonus?.(createStrike(AttackTag.ElementalSkill), enemy, party, [])).toBe(
      0,
    );
  });

  test("a critical normal attack restores the wielder the rank's share of its ATK as HP", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    damagePartyMember(context.party, TRAVELER_CHARACTER_ID, 0.5);
    justicePassiveModule.onKitEvent?.(createDamageTaken(AttackTag.NormalAttack, true), context, wielder);

    expect(getPartyMember(context.party, TRAVELER_CHARACTER_ID).healthShare).toBeCloseTo(
      0.5 + (wielder.attributes.attack * 0.6) / wielder.attributes.maxHealth,
    );
  });

  test("a hit that is not critical restores the wielder nothing", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    damagePartyMember(context.party, TRAVELER_CHARACTER_ID, 0.5);
    justicePassiveModule.onKitEvent?.(createDamageTaken(AttackTag.ChargedAttack, false), context, wielder);

    expect(getPartyMember(context.party, TRAVELER_CHARACTER_ID).healthShare).toBeCloseTo(0.5);
  });

  test("a second critical hit inside the rank's five seconds restores the wielder nothing more", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    damagePartyMember(context.party, TRAVELER_CHARACTER_ID, 0.5);
    justicePassiveModule.onKitEvent?.(createDamageTaken(AttackTag.NormalAttack, true), context, wielder);
    const restored = getPartyMember(context.party, TRAVELER_CHARACTER_ID).healthShare;
    justicePassiveModule.onKitEvent?.(createDamageTaken(AttackTag.NormalAttack, true), context, wielder);

    expect(getPartyMember(context.party, TRAVELER_CHARACTER_ID).healthShare).toBeCloseTo(restored);
  });
});
