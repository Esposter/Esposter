import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEffectState } from "#src/models/kit/KitEffectState";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { ReactionType } from "#src/models/combat/ReactionType";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { CHEVREUSE_CHARACTER_ID, createChevreuseKit } from "#src/services/kit/characters/chevreuseKit";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { readTalentMultipliers } from "#src/services/kit/readTalentMultipliers";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const CHEVREUSE_KIT = createChevreuseKit(
  await readTalentMultipliers(GAME_DATA_LOCAL_BASE_URL, [CHEVREUSE_CHARACTER_ID]),
);
const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);

const createChevreuseCombatant = (): Combatant => ({
  ascension: 0,
  attributes: computeCharacterAttributes([{ attribute: Attribute.BaseHealth, value: 10_000 }]),
  characterId: CHEVREUSE_CHARACTER_ID,
  constellationCount: 0,
  elementalResonances: [],
  kit: CHEVREUSE_KIT,
  level: 90,
});

describe(createChevreuseKit, () => {
  const combatant = createChevreuseCombatant();
  const holdLevel = takeOne(CHEVREUSE_KIT.elementalSkillHolds ?? []);

  test("reads the burst's cooldown and energy cost, and each strike's multiplier, from her proud skill groups", () => {
    expect.hasAssertions();

    expect(CHEVREUSE_KIT.burstCooldownSeconds).toBe(15);
    expect(CHEVREUSE_KIT.burstEnergyCost).toBe(60);
    expect(
      CHEVREUSE_KIT.normalAttacks.map(({ hits }) => hits.map(({ talentMultiplier }) => talentMultiplier)),
    ).toStrictEqual(
      [[0.5313], [0.4931], [0.2764, 0.3245], [0.7726]].map((row) => row.map((value) => expect.closeTo(value, 3))),
    );
  });

  test("an Overloaded reaction sets the Overcharged Ball going, and the hold that spends it casts the ball", () => {
    expect.hasAssertions();
    const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
    const kitEffectState: KitEffectState = { effects: [] };
    const context = createKitTestContext(combatant, { kitEffectState });
    const checkIsOvercharged = (): boolean => holdLevel.variant?.checkIsActive(context) ?? false;
    const triggerReaction = (reactionType: ReactionType): void =>
      CHEVREUSE_KIT.onKitEvent?.(
        { enemy, kind: KitEventKind.ReactionTriggered, reactions: [{ reactionType }], striker: combatant },
        context,
        combatant,
      );

    triggerReaction(ReactionType.Melt);
    const meltOnly = checkIsOvercharged();
    triggerReaction(ReactionType.Overloaded);
    const afterOverload = checkIsOvercharged();
    holdLevel.variant?.action.onStart?.(context);

    expect({ afterOverload, afterSpend: checkIsOvercharged(), meltOnly }).toStrictEqual({
      afterOverload: true,
      afterSpend: false,
      meltOnly: false,
    });
  });

  test("the burst's eight shells land after its animation ends, at their gcsim hitmarks", () => {
    expect.hasAssertions();
    const shellHitmarks = CHEVREUSE_KIT.elementalBurst.hits.slice(1).map(({ hitmarkSeconds }) => hitmarkSeconds);

    expect(shellHitmarks).toHaveLength(8);
    expect(Math.max(...shellHitmarks)).toBeGreaterThan(CHEVREUSE_KIT.elementalBurst.seconds);
  });
});
