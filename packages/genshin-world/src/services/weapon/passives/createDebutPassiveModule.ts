import type { KitBuff } from "#src/models/kit/KitBuff";
import type { WeaponPassiveModule } from "#src/models/weapon/WeaponPassiveModule";

import { Attribute } from "#src/models/character/Attribute";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { buffKitMember } from "#src/services/kit/effects/buffKitMember";
import { checkIsKitStatusActive } from "#src/services/kit/effects/checkIsKitStatusActive";
import { ELEMENTAL_DAMAGE_BONUS_ATTRIBUTES } from "#src/services/weapon/passives/constants";
import { takeOne } from "@esposter/shared";

const DEBUT_COOLDOWN_ID = "debutCooldown";

// The Widsith's Debut at its rank: when its wielder takes the field, a random theme song lasts for the rank's seconds, the
// Recitative raising ATK, the Aria all Elemental DMG and the Interlude Elemental Mastery, and the rank's cooldown holds off
// The next. The three themes are read from the rank's three values in turn
export const createDebutPassiveModule = (params: number[]): WeaponPassiveModule => {
  const attackPercentage = takeOne(params, 0);
  const elementalDamageBonus = takeOne(params, 1);
  const elementalMastery = takeOne(params, 2);
  const themeSeconds = takeOne(params, 3);
  const cooldownSeconds = takeOne(params, 4);
  const themes: Pick<KitBuff, "amount" | "attribute">[][] = [
    [{ amount: attackPercentage, attribute: Attribute.AttackPercent }],
    ELEMENTAL_DAMAGE_BONUS_ATTRIBUTES.map((attribute) => ({ amount: elementalDamageBonus, attribute })),
    [{ amount: elementalMastery, attribute: Attribute.ElementalMastery }],
  ];
  return {
    onKitEvent: (event, context, combatant) => {
      if (
        event.kind !== KitEventKind.CharacterSwapped ||
        event.characterId !== combatant.characterId ||
        checkIsKitStatusActive(context.kitEffectState.effects, combatant.characterId, DEBUT_COOLDOWN_ID)
      )
        return;
      addKitStatus(context.kitEffectState, combatant.characterId, {
        id: DEBUT_COOLDOWN_ID,
        secondsRemaining: cooldownSeconds,
      });
      const theme = themes[Math.floor(context.random() * themes.length)] ?? [];
      for (const { amount, attribute } of theme)
        buffKitMember(context.kitEffectState, combatant.characterId, {
          amount,
          attribute,
          secondsRemaining: themeSeconds,
          source: "debut",
        });
    },
  };
};
