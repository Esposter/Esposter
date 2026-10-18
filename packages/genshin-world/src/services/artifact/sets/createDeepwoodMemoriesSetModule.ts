import type { ArtifactSetBonus } from "#src/models/artifact/ArtifactSetBonus";
import type { PassiveModule } from "#src/models/kit/PassiveModule";

import { AttackTag } from "#src/models/combat/AttackTag";
import { Element } from "#src/models/Element";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { addEnemyStatus } from "#src/services/enemy/addEnemyStatus";
import { takeOne } from "@esposter/shared";

const DEEPWOOD_MEMORIES_STATUS_ID = "deepwoodMemories";

// Deepwood Memories. Its four-piece bonus, when its wearer's Elemental Skill or Burst hits an opponent, lowers the opponent's
// Dendro RES by the first param for the second param's seconds, a later hit restarting it. It triggers whether or not its
// Wearer is on the field
export const createDeepwoodMemoriesSetModule = (bonus: ArtifactSetBonus): PassiveModule => {
  const resistanceReduction = takeOne(bonus.params, 0);
  const seconds = takeOne(bonus.params, 1);
  return {
    onKitEvent: (event, _context, combatant) => {
      if (
        event.kind !== KitEventKind.DamageTaken ||
        event.striker.characterId !== combatant.characterId ||
        (event.attackTag !== AttackTag.ElementalSkill && event.attackTag !== AttackTag.ElementalBurst)
      )
        return;
      addEnemyStatus(event.enemy, {
        damageTakenBonus: 0,
        id: DEEPWOOD_MEMORIES_STATUS_ID,
        resistanceReduction: { [Element.Dendro]: resistanceReduction },
        secondsRemaining: seconds,
      });
    },
  };
};
