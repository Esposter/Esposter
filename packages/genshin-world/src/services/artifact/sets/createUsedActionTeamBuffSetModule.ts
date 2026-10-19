import type { Attribute } from "#src/models/character/Attribute";
import type { PassiveModule } from "#src/models/kit/PassiveModule";

import { CombatTalent } from "#src/models/character/CombatTalent";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { buffKitTeam } from "#src/services/kit/effects/buffKitTeam";

// A set's bonus that gives every deployed member the attribute's amount for the seconds given after its wearer uses an
// Elemental Skill or Burst, each of the actions given, as the next use restarts the buff rather than stacking it
export const createUsedActionTeamBuffSetModule = ({
  actions,
  amount,
  attribute,
  seconds,
  source,
}: {
  actions: (CombatTalent.ElementalBurst | CombatTalent.ElementalSkill)[];
  amount: number;
  attribute: Attribute;
  seconds: number;
  source: string;
}): PassiveModule => ({
  onKitEvent: (event, { kitEffectState, party }, combatant) => {
    if (!("characterId" in event) || event.characterId !== combatant.characterId) return;
    const action =
      event.kind === KitEventKind.SkillUsed
        ? CombatTalent.ElementalSkill
        : event.kind === KitEventKind.BurstUsed
          ? CombatTalent.ElementalBurst
          : undefined;
    if (action === undefined || !actions.includes(action)) return;
    buffKitTeam(kitEffectState, party, { amount, attribute, secondsRemaining: seconds, source });
  },
});
