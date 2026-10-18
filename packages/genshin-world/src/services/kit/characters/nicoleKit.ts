import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitHitbox } from "#src/models/kit/KitHitbox";
import type { KitRecordReader } from "#src/models/kit/KitRecordReader";

import { Attribute } from "#src/models/character/Attribute";
import { Element } from "#src/models/Element";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { ALBEDO_CHARACTER_ID } from "#src/services/kit/characters/albedoKit";
import { KLEE_CHARACTER_ID } from "#src/services/kit/characters/kleeKit";
import { RAZOR_CHARACTER_ID } from "#src/services/kit/characters/razorKit";
import { SUCROSE_CHARACTER_ID } from "#src/services/kit/characters/sucroseKit";
import { checkIsKitHexerei } from "#src/services/kit/countKitHexereiMembers";
import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { buffKitMember } from "#src/services/kit/effects/buffKitMember";
import { castKitShield } from "#src/services/kit/effects/castKitShield";
import { findKitStatus } from "#src/services/kit/effects/findKitStatus";
import { removeKitEffects } from "#src/services/kit/effects/removeKitEffects";
import { scheduleKitTask } from "#src/services/kit/effects/scheduleKitTask";
import { startKitCooldown } from "#src/services/kit/effects/startKitCooldown";
import { strikeKitEnemies } from "#src/services/kit/strikeKitEnemies";
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

// The burst's status lasts 20 seconds, gcsim's burstKey
const BURST_SECONDS = 20;
// The burst starts its status and clears its projections one frame after its hit, as gcsim's task at burstHitmark+1 does,
// So a hit before that makes no projection
const BURST_STATUS_SECONDS = 109 / 60;
const BURST_STATUS_ID = "nicole-burst";
// A projection lands 30 frames after the hit that starts it, gcsim's projectionHitmark, and four come from one burst at most
const PROJECTION_SECONDS = 30 / 60;
const PROJECTION_LIMIT = 4;
// A projection holds a 3-second internal cooldown, gcsim's burstICDKey
const PROJECTION_ICD_SECONDS = 3;
const PROJECTION_ICD_ID = "nicole-burst-projection-icd";
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/nicole/burst.go

// The offsets are gcsim's meleeOffset and rangeOffset: a projection's hitbox sits about the enemy its burst hits, in the world's axes
const MELEE_OFFSET = { x: -1.5, z: 2.5 };
const RANGE_OFFSET = { x: -2.5, z: 2.5 };
const PROJECTION_RADIUS = 4.5;

// The kleeOffset is gcsim's: the melee offset pulled back a metre and a half along its own direction, then half a metre across it
const createKleeOffset = ({ x, z }: { x: number; z: number }): { x: number; z: number } => {
  const length = Math.hypot(x, z);
  const normX = x / length;
  const normZ = z / length;
  // The Perp in gcsim turns a point to (-Y, X), so the half metre runs along (-normZ, normX)
  return { x: x - normX * 1.5 - normZ * 0.5, z: z - normZ * 1.5 + normX * 0.5 };
};

// The hitbox a projection takes by the character it projects, as gcsim's projectionHitbox table has it, and the default for a
// Character the table does not name
const PROJECTION_HITBOXES = new Map<number, KitHitbox>([
  [ALBEDO_CHARACTER_ID, { offset: MELEE_OFFSET, shape: { kind: "box", length: 8, width: 3 } }],
  [RAZOR_CHARACTER_ID, { offset: MELEE_OFFSET, shape: { kind: "circle", radius: PROJECTION_RADIUS } }],
  [SUCROSE_CHARACTER_ID, { offset: MELEE_OFFSET, shape: { kind: "circle", radius: PROJECTION_RADIUS } }],
  [KLEE_CHARACTER_ID, { offset: createKleeOffset(MELEE_OFFSET), shape: { kind: "circle", radius: PROJECTION_RADIUS } }],
]);
const DEFAULT_PROJECTION_HITBOX: KitHitbox = {
  offset: RANGE_OFFSET,
  shape: { kind: "circle", radius: PROJECTION_RADIUS },
};
// A projection reaches its enemies by its hitbox alone, so its hit has no area of its own
const PROJECTION_HIT_AREA = { angle: 0, height: 0, radius: 0 };

// Nicole's behaviour: her skill's shield and team ATK buff, and her burst's projections. Her passives wait on their hooks, as
// Each reads her projections or the party's Elemental Resonance. Her strikes, charged attack, plunges, skill's hit and burst's
// Own two hits are her record's alone
export const createNicoleKitBehaviour = ({ readParameter }: KitRecordReader): KitBehaviour => {
  const burstProjection = readParameter("burstProjection");
  const skillShieldAtk = readParameter("skillShieldAtk");
  const skillShieldFlat = readParameter("skillShieldFlat");
  const skillBuffRatio = readParameter("skillBuffRatio");
  const skillBuffMax = readParameter("skillBuffMax");

  return {
    burst: {
      // Her burst clears any status it left, and starts its own one frame after its hit, which then counts its projections
      onStart: ({ activeCombatant: combatant, kitEffectState }) => {
        removeKitEffects(kitEffectState, (effect) => effect.kind === "status" && effect.id === BURST_STATUS_ID);
        scheduleKitTask(kitEffectState, combatant.characterId, BURST_STATUS_SECONDS, (tick) => {
          addKitStatus(tick.kitEffectState, combatant.characterId, {
            id: BURST_STATUS_ID,
            secondsRemaining: BURST_SECONDS,
            stacks: 0,
          });
        });
      },
    },
    // Her burst projects a copy of the active character's elemental hit onto the enemy it struck, as gcsim's OnEnemyHit hook
    // Does, at most four times and once each 3 seconds
    onKitEvent: (event, context, combatant) => {
      if (event.kind !== KitEventKind.ElementalHit || event.striker.characterId !== context.activeCombatant.characterId)
        return;
      const burst = findKitStatus(context.kitEffectState.effects, combatant.characterId, BURST_STATUS_ID);
      if (!burst || burst.secondsRemaining <= 0 || (burst.stacks ?? 0) >= PROJECTION_LIMIT) return;
      if (!startKitCooldown(context.kitEffectState, combatant.characterId, PROJECTION_ICD_ID, PROJECTION_ICD_SECONDS))
        return;
      burst.stacks = (burst.stacks ?? 0) + 1;
      const { enemy, striker } = event;
      scheduleKitTask(context.kitEffectState, combatant.characterId, PROJECTION_SECONDS, (tick) => {
        // The Hexerei projection bonus, gcsim's hexereiOnProjection: three times her attack, when she and the projected character
        // Are Hexerei and two or more Hexerei are deployed
        const flatDamage =
          checkIsKitHexerei(combatant.characterId) && checkIsKitHexerei(striker.characterId) && tick.hexereiCount >= 2
            ? combatant.attributes.attack * 3
            : 0;
        strikeKitEnemies(
          [
            {
              body: tick.body,
              combatant: striker,
              hit: {
                additiveBaseDamageBonus: () => flatDamage,
                hitArea: PROJECTION_HIT_AREA,
                hitmarkSeconds: 0,
                poiseDamage: 0,
                talentMultiplier: burstProjection,
              },
              hitbox: PROJECTION_HITBOXES.get(striker.characterId) ?? DEFAULT_PROJECTION_HITBOX,
              target: enemy,
            },
          ],
          tick,
        );
      });
    },
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
