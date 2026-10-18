import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitRecordReader } from "#src/models/kit/KitRecordReader";

import { Attribute } from "#src/models/character/Attribute";
import { Element } from "#src/models/Element";
import { buffKitMember } from "#src/services/kit/effects/buffKitMember";
import { castKitShield } from "#src/services/kit/effects/castKitShield";
import { removeKitEffects } from "#src/services/kit/effects/removeKitEffects";
import { scheduleKitTask } from "#src/services/kit/effects/scheduleKitTask";
import { getDeployedCharacterIds } from "#src/services/party/getDeployedCharacterIds";

export const NICOLE_CHARACTER_ID = 10_000_131;

// Revelation's shield and the team's ATK buff come on at the skill's hitmark less one frame, which gcsim queues on the
// Character's task (skill.go's QueueCharTask at skillHitmark-1)
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/nicole/skill.go
const SKILL_SNAPSHOT_SECONDS = 8 / 60;
// The shield and the buff last 20 seconds, gcsim's skillDur
const SKILL_SECONDS = 20;
// The buff's source is gcsim's skillBuffKey: a recast deletes the buff it gave before its own snapshot, so it restarts
const SKILL_BUFF_SOURCE = "grace-of-kenosis";

// Nicole's behaviour: her skill's shield and team ATK buff, and her burst's projections and passives wait on their hooks.
// Her strikes, charged attack, plunges, skill's hit and burst's two hits are her record's alone
export const createNicoleKitBehaviour = ({ readParameter }: KitRecordReader): KitBehaviour => {
  const skillShieldAtk = readParameter("skillShieldAtk");
  const skillShieldFlat = readParameter("skillShieldFlat");
  const skillBuffRatio = readParameter("skillBuffRatio");
  const skillBuffMax = readParameter("skillBuffMax");

  return {
    skill: {
      // Revelation: Uncreated Light shields the team with a Pyro shield scaled by her attack, and gives each deployed member an
      // ATK buff scaled by her attack, capped at the skill's maximum
      onStart: ({ activeCombatant: combatant, kitEffectState }) => {
        removeKitEffects(kitEffectState, (effect) => effect.kind === "buff" && effect.source === SKILL_BUFF_SOURCE);
        scheduleKitTask(kitEffectState, combatant.characterId, SKILL_SNAPSHOT_SECONDS, (tick) => {
          castKitShield(tick.kitEffectState, combatant.characterId, {
            element: Element.Pyro,
            health: skillShieldAtk * combatant.attributes.attack + skillShieldFlat,
            secondsRemaining: SKILL_SECONDS,
          });
          const amount = Math.min(combatant.attributes.attack * skillBuffRatio, skillBuffMax);
          for (const characterId of getDeployedCharacterIds(tick.party))
            buffKitMember(tick.kitEffectState, characterId, {
              amount,
              attribute: Attribute.Attack,
              secondsRemaining: SKILL_SECONDS,
              source: SKILL_BUFF_SOURCE,
            });
        });
      },
    },
  };
};
