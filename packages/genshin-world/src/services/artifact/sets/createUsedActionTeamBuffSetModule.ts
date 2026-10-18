import type { Attribute } from "#src/models/character/Attribute";
import type { ArtifactSetModule } from "#src/models/artifact/ArtifactSetModule";

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
  actions: ("burst" | "skill")[];
  amount: number;
  attribute: Attribute;
  seconds: number;
  source: string;
}): ArtifactSetModule => ({
  onKitEvent: (event, { kitEffectState, party }, combatant) => {
    if (event.characterId !== combatant.characterId) return;
    const action =
      event.kind === KitEventKind.SkillUsed ? "skill" : event.kind === KitEventKind.BurstUsed ? "burst" : undefined;
    if (action === undefined || !actions.includes(action)) return;
    buffKitTeam(kitEffectState, party, { amount, attribute, secondsRemaining: seconds, source });
  },
});
