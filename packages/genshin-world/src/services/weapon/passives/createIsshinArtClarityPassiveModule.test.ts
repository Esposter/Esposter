import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEffectState } from "#src/models/kit/KitEffectState";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { AttackTag } from "#src/models/combat/AttackTag";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { SMALL_AOE_AREA } from "#src/services/weapon/passives/constants";
import { createIsshinArtClarityPassiveModule } from "#src/services/weapon/passives/createIsshinArtClarityPassiveModule";
import { createWielderCombatant } from "#src/services/weapon/passives/createWielderCombatant.test";
import { getBuff } from "#src/services/weapon/passives/getBuff.test";
import { describe, expect, test } from "vitest";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const TRAVELER_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);

describe(createIsshinArtClarityPassiveModule, () => {
  const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
  const wielder: Combatant = createWielderCombatant();
  // Isshin Art Clarity with synthetic params: 180% ATK as the Gale's hit, 15% ATK for eight seconds, once every eight seconds
  const isshinArtClarityPassiveModule = createIsshinArtClarityPassiveModule([1.8, 0.15, 8, 8]);
  const createDamageTaken = (attackTag: AttackTag, striker: Combatant = wielder) => ({
    attackTag,
    enemy,
    hit: TRAVELER_KIT.plungeCollision,
    isCritical: false,
    isDefeated: false,
    kind: KitEventKind.DamageTaken as const,
    striker,
  });

  test("a normal, charged or plunging attack the wielder lands queues the gale and raises its ATK", () => {
    expect.hasAssertions();

    for (const attackTag of [AttackTag.NormalAttack, AttackTag.ChargedAttack, AttackTag.PlungingAttack]) {
      const kitEffectState: KitEffectState = { effects: [] };
      const context = createKitTestContext(wielder, { kitEffectState });
      isshinArtClarityPassiveModule.onKitEvent?.(createDamageTaken(attackTag), context, wielder);

      expect(context.strikes).toStrictEqual([
        {
          body: context.body,
          combatant: wielder,
          hit: { hitArea: SMALL_AOE_AREA, hitmarkSeconds: 0, poiseDamage: 0, talentMultiplier: 1.8 },
        },
      ]);
      expect(getBuff(kitEffectState, Attribute.AttackPercent)).toStrictEqual({
        amount: 0.15,
        attribute: Attribute.AttackPercent,
        characterId: wielder.characterId,
        kind: "buff",
        secondsRemaining: 8,
        source: "isshinArtClarity",
      });
    }
  });

  test("a hit inside the cooldown queues no second gale and raises no further ATK", () => {
    expect.hasAssertions();

    const kitEffectState: KitEffectState = { effects: [] };
    const context = createKitTestContext(wielder, { kitEffectState });
    isshinArtClarityPassiveModule.onKitEvent?.(createDamageTaken(AttackTag.NormalAttack), context, wielder);
    isshinArtClarityPassiveModule.onKitEvent?.(createDamageTaken(AttackTag.NormalAttack), context, wielder);

    expect(context.strikes).toHaveLength(1);
    expect(kitEffectState.effects.filter((effect) => effect.kind === "buff")).toHaveLength(1);
  });

  test("an attack by another character draws no gale", () => {
    expect.hasAssertions();

    const kitEffectState: KitEffectState = { effects: [] };
    const context = createKitTestContext(wielder, { kitEffectState });
    const otherCharacter: Combatant = { ...wielder, characterId: TRAVELER_CHARACTER_ID + 1 };
    isshinArtClarityPassiveModule.onKitEvent?.(
      createDamageTaken(AttackTag.NormalAttack, otherCharacter),
      context,
      wielder,
    );

    expect(context.strikes).toHaveLength(0);
    expect(kitEffectState.effects).toHaveLength(0);
  });
});
