import type { ArtifactSetBonus } from "#src/models/artifact/ArtifactSetBonus";
import type { PassiveModule } from "#src/models/kit/PassiveModule";

import { Attribute } from "#src/models/character/Attribute";
import { AttackTag } from "#src/models/combat/AttackTag";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { checkIsKitStatusActive } from "#src/services/kit/effects/checkIsKitStatusActive";
import { findKitStatus } from "#src/services/kit/effects/findKitStatus";
import { getActiveCharacterId } from "#src/services/party/getActiveCharacterId";
import { takeOne } from "@esposter/shared";

const PALE_FLAME_STACKS_ID = "paleFlameStacks";
const PALE_FLAME_COOLDOWN_ID = "paleFlameCooldown";
// The most stacks the set gives, as its text says
const MAXIMUM_STACKS = 2;

// Pale Flame. Its four-piece bonus gives its wearer a stack on each Elemental Skill hit the wearer lands on an enemy while it is the
// Active character, no more than once every third param's seconds. A stack raises ATK by the first param, up to two stacks, and two
// Stacks add the fourth param's Physical DMG on top of the two-piece's. The stacks share one timer of the second param's seconds, which
// Each stack gained restarts, and they end together, as gcsim's stat mod does. The two-piece bonus is attributes only
export const createPaleFlameSetModule = (bonus: ArtifactSetBonus): PassiveModule => {
  const attackBonusPerStack = takeOne(bonus.params, 0);
  const seconds = takeOne(bonus.params, 1);
  const cooldownSeconds = takeOne(bonus.params, 2);
  const physicalDamageBonus = takeOne(bonus.params, 3);
  return {
    getPassiveBonuses: (combatant, _healthShare, _deployedCombatants, effects) => {
      const { characterId } = combatant;
      if (!checkIsKitStatusActive(effects, characterId, PALE_FLAME_STACKS_ID)) return [];
      const stacks = findKitStatus(effects, characterId, PALE_FLAME_STACKS_ID)?.stacks ?? 0;
      return [
        { amount: attackBonusPerStack * stacks, attribute: Attribute.AttackPercent },
        ...(stacks >= MAXIMUM_STACKS
          ? [{ amount: physicalDamageBonus, attribute: Attribute.PhysicalDamageBonus }]
          : []),
      ];
    },
    onKitEvent: (event, context, combatant) => {
      const { characterId } = combatant;
      const { kitEffectState, party } = context;
      if (
        event.kind !== KitEventKind.DamageTaken ||
        event.striker.characterId !== characterId ||
        event.attackTag !== AttackTag.ElementalSkill ||
        getActiveCharacterId(party) !== characterId ||
        checkIsKitStatusActive(kitEffectState.effects, characterId, PALE_FLAME_COOLDOWN_ID)
      )
        return;
      // The stacks end together, so a stack gained once they have ended starts again from one
      const stacks = checkIsKitStatusActive(kitEffectState.effects, characterId, PALE_FLAME_STACKS_ID)
        ? (findKitStatus(kitEffectState.effects, characterId, PALE_FLAME_STACKS_ID)?.stacks ?? 0)
        : 0;
      addKitStatus(kitEffectState, characterId, {
        id: PALE_FLAME_STACKS_ID,
        secondsRemaining: seconds,
        stacks: Math.min(stacks + 1, MAXIMUM_STACKS),
      });
      addKitStatus(kitEffectState, characterId, { id: PALE_FLAME_COOLDOWN_ID, secondsRemaining: cooldownSeconds });
    },
  };
};
