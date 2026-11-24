import type { KitContext } from "#src/models/kit/KitContext";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { AttackTag } from "#src/models/combat/AttackTag";
import { Element } from "#src/models/Element";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { FIXED_STEP_SECONDS } from "#src/services/constants";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { createKitTestContext, stepKitSeconds } from "#src/services/kit/createKitTestContext.test";
import { createParty } from "#src/services/party/createParty";
import { getPartyMember } from "#src/services/party/getPartyMember";
import { ELEMENTAL_DAMAGE_BONUS_ATTRIBUTES } from "#src/services/weapon/passives/constants";
import { createMistsplittersEdgePassiveModule } from "#src/services/weapon/passives/createMistsplittersEdgePassiveModule";
import { createWielderCombatant } from "#src/services/weapon/passives/createWielderCombatant.test";
import { describe, expect, test } from "vitest";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);

describe(createMistsplittersEdgePassiveModule, () => {
  const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
  const wielder = { ...createWielderCombatant(), element: Element.Pyro };
  // Mistsplitter's Edge at its first rank: 12% Elemental DMG Bonus on every element, and the Emblem's 8%, 16% and
  // 28% on the wielder's element for one, two and three stacks, from a normal attack's elemental hit for five seconds.
  // A burst for ten seconds, and the Energy short of full, which holds one until it is full
  const passiveModule = createMistsplittersEdgePassiveModule([0.12, 0.08, 0.16, 0.28, 5, 10]);
  // A context whose wielder has its Energy full, so no stack is held for the Energy short of full
  const createFullEnergyContext = (): KitContext => {
    const party = createParty([TRAVELER_CHARACTER_ID]);
    getPartyMember(party, TRAVELER_CHARACTER_ID).energy = wielder.kit.burstEnergyCost;
    return createKitTestContext(wielder, { party });
  };
  const readBonuses = (context: KitContext) =>
    passiveModule.getPassiveBonuses?.(wielder, 1, [], context.kitEffectState.effects) ?? [];
  const normalAttackHit = (context: KitContext) =>
    passiveModule.onKitEvent?.(
      {
        attackTag: AttackTag.NormalAttack,
        element: Element.Pyro,
        enemy,
        kind: KitEventKind.EnemyHit,
        striker: wielder,
      },
      context,
      wielder,
    );
  const elementalBonuses = ELEMENTAL_DAMAGE_BONUS_ATTRIBUTES.map((attribute) => ({ amount: 0.12, attribute }));

  test("its Elemental DMG Bonus is a passive bonus on every element, and a full Energy holds no Emblem share", () => {
    expect.hasAssertions();

    expect(readBonuses(createFullEnergyContext())).toStrictEqual(elementalBonuses);
  });

  test("the stacks raise the wielder's element by the rank's share for each level, and a fourth is held at three", () => {
    expect.hasAssertions();

    const context = createFullEnergyContext();
    normalAttackHit(context);
    stepKitSeconds(context, 1);
    normalAttackHit(context);

    expect(readBonuses(context)).toStrictEqual([
      ...elementalBonuses,
      { amount: 0.16, attribute: Attribute.PyroDamageBonus },
    ]);

    normalAttackHit(context);
    normalAttackHit(context);

    expect(readBonuses(context)).toStrictEqual([
      ...elementalBonuses,
      { amount: 0.28, attribute: Attribute.PyroDamageBonus },
    ]);
  });

  test("a stack runs its own seconds, so a normal attack's lapses first and a burst's stands on", () => {
    expect.hasAssertions();

    const context = createFullEnergyContext();
    normalAttackHit(context);
    passiveModule.onKitEvent?.(
      { characterId: TRAVELER_CHARACTER_ID, energyCost: 60, kind: KitEventKind.BurstUsed },
      context,
      wielder,
    );
    stepKitSeconds(context, 6);

    expect(readBonuses(context)).toStrictEqual([
      ...elementalBonuses,
      { amount: 0.08, attribute: Attribute.PyroDamageBonus },
    ]);
  });

  test("energy short of full holds a stack, which goes when the energy is full", () => {
    expect.hasAssertions();

    const party = createParty([TRAVELER_CHARACTER_ID]);
    const context = createKitTestContext(wielder, { party });
    passiveModule.onStep?.(context, wielder, FIXED_STEP_SECONDS);

    expect(readBonuses(context)).toStrictEqual([
      ...elementalBonuses,
      { amount: 0.08, attribute: Attribute.PyroDamageBonus },
    ]);

    getPartyMember(party, TRAVELER_CHARACTER_ID).energy = wielder.kit.burstEnergyCost;
    passiveModule.onStep?.(context, wielder, FIXED_STEP_SECONDS);

    expect(readBonuses(context)).toStrictEqual(elementalBonuses);
  });
});
