import type { Enemy } from "#src/models/enemy/Enemy";
import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEffect } from "#src/models/kit/KitEffect";

import { Attribute } from "#src/models/character/Attribute";
import { Element } from "#src/models/Element";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { getDamage } from "#src/services/combat/damage/getDamage";
import { computeEnemyStats } from "#src/services/enemy/computeEnemyStats";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { getEnemyKind } from "#src/services/enemy/getEnemyKind";
import { createTravelerKit } from "#src/services/kit/characters/travelerKit";
import { readTalentMultipliers } from "#src/services/kit/readTalentMultipliers";
import { strikeEnemy } from "#src/services/kit/strikeEnemy";
import { addEnduringRockStatus } from "#src/services/party/addEnduringRockStatus";
import { describe, expect, test } from "vitest";

const TRAVELER_KIT = createTravelerKit(await readTalentMultipliers([TRAVELER_CHARACTER_ID]));

const NEVER_CRITICAL = (): number => 1;

describe(addEnduringRockStatus, () => {
  const CHARACTER_ID = TRAVELER_CHARACTER_ID;
  const ATTACK = 100;
  const LEVEL = 90;
  const STURDY_HEALTH = 1e9;
  const kind = getEnemyKind(ENEMY_CAMP_MEMBER.enemyKindId);
  const { defense } = computeEnemyStats(kind, ENEMY_CAMP_MEMBER.level);
  const createSturdyEnemy = (): Enemy => ({
    ...createEnemy(ENEMY_CAMP_MEMBER, ""),
    health: STURDY_HEALTH,
    maxHealth: STURDY_HEALTH,
  });
  const geoCombatant: Combatant = {
    ascension: 0,
    attributes: computeCharacterAttributes([{ attribute: Attribute.Attack, value: ATTACK }]),
    characterId: CHARACTER_ID,
    constellationCount: 0,
    elementalResonances: [Element.Geo],
    kit: TRAVELER_KIT,
    level: LEVEL,
  };
  const shield: KitEffect = { characterId: CHARACTER_ID, health: 100, kind: "shield", secondsRemaining: 12 };

  test("lowers the Geo RES an enemy struck under a live shield has by 20% for 15 seconds, and the hit reads it", () => {
    expect.hasAssertions();

    const enemy = createSturdyEnemy();
    addEnduringRockStatus(enemy, geoCombatant, [shield]);
    const kitHit = { ...TRAVELER_KIT.plungeCollision, element: Element.Geo };
    const damage = getDamage({
      attackerLevel: LEVEL,
      defense,
      resistance: kind.elementResistances[Element.Geo] - 0.2,
      stat: ATTACK,
      talentMultiplier: kitHit.talentMultiplier,
    });

    strikeEnemy(enemy, kitHit, geoCombatant, NEVER_CRITICAL);

    expect(enemy.statuses).toStrictEqual([
      { damageTakenBonus: 0, id: "enduringRock", resistanceReduction: { [Element.Geo]: 0.2 }, secondsRemaining: 15 },
    ]);
    expect(enemy.health).toBeCloseTo(enemy.maxHealth - damage);
  });

  test("gives no RES drop without a live shield, or without the Geo resonance", () => {
    expect.hasAssertions();

    const unshielded = createSturdyEnemy();
    addEnduringRockStatus(unshielded, geoCombatant, [{ ...shield, secondsRemaining: 0 }]);
    const unresonated = createSturdyEnemy();
    addEnduringRockStatus(unresonated, { ...geoCombatant, elementalResonances: [] }, [shield]);

    expect([unshielded.statuses, unresonated.statuses]).toStrictEqual([[], []]);
  });
});
