import type { Combatant } from "#src/models/kit/Combatant";
import type { KitBuff } from "#src/models/kit/KitBuff";
import type { KitEffectState } from "#src/models/kit/KitEffectState";

import { Attribute } from "#src/models/character/Attribute";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { OTHER_CHARACTER_ID } from "#src/services/weapon/passives/constants.test";
import { createCharacterSwapped } from "#src/services/weapon/passives/createCharacterSwapped.test";
import { createHeritagePassiveModule } from "#src/services/weapon/passives/createHeritagePassiveModule";
import { createWielderCombatant } from "#src/services/weapon/passives/createWielderCombatant.test";
import { describe, expect, test } from "vitest";

const getAttackBuffs = (kitEffectState: KitEffectState): KitBuff[] =>
  kitEffectState.effects.filter(
    (effect): effect is KitBuff => effect.kind === "buff" && effect.attribute === Attribute.AttackPercent,
  );

describe(createHeritagePassiveModule, () => {
  const wielder: Combatant = createWielderCombatant();
  // Heritage with synthetic params: the ATK percentage, its seconds and the cooldown on its wielder
  const heritagePassiveModule = createHeritagePassiveModule([0.2, 8, 15]);

  test("a character swapped onto the field gains the rank's ATK percentage for its seconds", () => {
    expect.hasAssertions();

    const kitEffectState: KitEffectState = { effects: [] };
    const context = createKitTestContext(wielder, { kitEffectState });
    heritagePassiveModule.onKitEvent?.(
      createCharacterSwapped(OTHER_CHARACTER_ID, TRAVELER_CHARACTER_ID),
      context,
      wielder,
    );

    expect(
      getAttackBuffs(kitEffectState).map(({ amount, characterId, secondsRemaining }) => ({
        amount,
        characterId,
        secondsRemaining,
      })),
    ).toStrictEqual([{ amount: 0.2, characterId: OTHER_CHARACTER_ID, secondsRemaining: 8 }]);
  });

  test("a second swap inside the rank's cooldown gains nothing", () => {
    expect.hasAssertions();

    const kitEffectState: KitEffectState = { effects: [] };
    const context = createKitTestContext(wielder, { kitEffectState });
    heritagePassiveModule.onKitEvent?.(
      createCharacterSwapped(OTHER_CHARACTER_ID, TRAVELER_CHARACTER_ID),
      context,
      wielder,
    );
    heritagePassiveModule.onKitEvent?.(
      createCharacterSwapped(OTHER_CHARACTER_ID, TRAVELER_CHARACTER_ID),
      context,
      wielder,
    );

    expect(getAttackBuffs(kitEffectState)).toHaveLength(1);
  });
});
