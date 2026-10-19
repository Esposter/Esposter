import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitEvent } from "#src/models/kit/KitEvent";

import { AttackTag } from "#src/models/combat/AttackTag";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { startKitCooldown } from "#src/services/kit/effects/startKitCooldown";

// Whether the combatant's own Elemental Skill hits an enemy while its cooldown is not running, and if so, starts that
// Cooldown for the seconds given
export const startKitElementalSkillHitCooldown = (
  event: KitEvent,
  kitEffectState: KitEffectState,
  combatant: Combatant,
  cooldownId: string,
  cooldownSeconds: number,
): boolean =>
  event.kind === KitEventKind.DamageTaken &&
  event.striker.characterId === combatant.characterId &&
  event.attackTag === AttackTag.ElementalSkill &&
  startKitCooldown(kitEffectState, combatant.characterId, cooldownId, cooldownSeconds);
