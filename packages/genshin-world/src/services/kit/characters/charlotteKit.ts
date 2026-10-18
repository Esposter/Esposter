import type { EnemyStatus } from "#src/models/enemy/EnemyStatus";
import type { Combatant } from "#src/models/kit/Combatant";
import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitBody } from "#src/models/kit/KitBody";
import type { KitContext } from "#src/models/kit/KitContext";
import type { KitRecordReader } from "#src/models/kit/KitRecordReader";

import { KitEventKind } from "#src/models/kit/KitEventKind";
import { SUMMON_LINGER_SECONDS } from "#src/services/kit/constants";
import { createAheadBody } from "#src/services/kit/createAheadBody";
import { castKitField } from "#src/services/kit/effects/castKitField";
import { castKitSummon } from "#src/services/kit/effects/castKitSummon";
import { changeKitMemberHealth } from "#src/services/kit/effects/changeKitMemberHealth";
import { scheduleKitTask } from "#src/services/kit/effects/scheduleKitTask";
import { startKitCooldown } from "#src/services/kit/effects/startKitCooldown";
import { getDeployedCharacterIds } from "#src/services/party/getDeployedCharacterIds";
import { takeOne } from "@esposter/shared";

export const CHARLOTTE_CHARACTER_ID = 10_000_088;

// Spiritbreath Thorn's cooldown starts when it strikes, as gcsim (MIT) charlotte/charge.go gives it
// https://github.com/genshinsim/gcsim/tree/main/internal/characters/charlotte
const THORN_COOLDOWN_STATUS_ID = "charlotte-thorn-cooldown";

// Framing's press marks each enemy it strikes with Snappy Silhouette, ticking every 1.5 seconds from the mark, and no more
// Than five enemies a cast, as gcsim (MIT) charlotte/skill.go gives it
// https://github.com/genshinsim/gcsim/tree/main/internal/characters/charlotte
const SNAPPY_MARK_STATUS_ID = "charlotte-snappy-silhouette";
const SNAPPY_MARK_INTERVAL_SECONDS = 1.5;
const SNAPPY_MARK_CAP = 5;

// Each Kamera tick heals the character on the field while it stands within a circle of radius 7 round the point Still
// Photo was cast at, 4.5 metres ahead of the body, as gcsim (MIT) charlotte/burst.go gives it
// https://github.com/genshinsim/gcsim/tree/main/internal/characters/charlotte
const BURST_OFFSET_METRES = 4.5;
const BURST_HEAL_RADIUS = 7;

const healTeam = (context: KitContext, caster: Combatant, flatHealth: number, attackShare: number): void => {
  const healedHealth = flatHealth + attackShare * caster.attributes.attack;
  for (const characterId of getDeployedCharacterIds(context.party))
    changeKitMemberHealth(context, caster, characterId, healedHealth);
};

// Charlotte's behaviour: the charged attack opens Spiritbreath Thorn on its target, off its cooldown, and Framing's press
// Marks the first five enemies it strikes with Snappy Silhouette, each tick of which is a hit on that enemy alone. Still
// Photo casts Kamera's strikes, heals the whole party as its hit lands, and each Kamera tick heals the character on the
// Field within the circle it was cast at
// Constellation 1 needs a heal every two seconds for six seconds on the healed character, which no status carries
// Constellation 2 needs Framing's Monsieur Verite hits counted per enemy, which the hold does not build
// Constellation 4 needs the hold's Focused Impression mark, which is not built, for Still Photo's hits to read
// Constellation 6 needs the hold's Focused Impression mark, which is not built, and the active character's hits on it
export const createCharlotteKitBehaviour = ({
  kit,
  readHit,
  readHits,
  readParameter,
  readSeconds,
}: KitRecordReader): KitBehaviour => {
  const thorn = readHit("thorn");
  const thornHitmarkSeconds = readSeconds("thornHitmark");
  const thornCooldownSeconds = readParameter("spiritbreathThornCooldownSeconds");
  const snappyMarkHit = readHit("snappyMark");
  const snappyMarkSeconds = readSeconds("snappyMark");
  const kameraHits = readHits("kamera");
  const burstHitmarkSeconds = takeOne(kit.elementalBurst.hits).hitmarkSeconds;
  const stillPhotoFlatHealth = readParameter("stillPhotoFlatHealth");
  const stillPhotoAttackShare = readParameter("stillPhotoAttackShare");
  const kameraFlatHealth = readParameter("kameraFlatHealth");
  const kameraAttackShare = readParameter("kameraAttackShare");
  // The marks Framing's press puts on the enemies it strikes: a cast marks the first five, and a tick is a hit on that
  // Enemy alone. The count is reset as each press starts, so it counts the enemies of the press that is landing
  let markedCount = 0;
  // The mark Framing's press puts on each enemy it strikes, ticking every interval from the mark
  const createSnappyMark = (): EnemyStatus => ({
    damageTakenBonus: 0,
    id: SNAPPY_MARK_STATUS_ID,
    nextTickSeconds: SNAPPY_MARK_INTERVAL_SECONDS,
    secondsRemaining: snappyMarkSeconds,
    tickIntervalSeconds: SNAPPY_MARK_INTERVAL_SECONDS,
  });
  return {
    burst: {
      onStart: ({ activeCombatant: combatant, body, kitEffectState }) => {
        const { characterId } = combatant;
        const castCentre = createAheadBody(body, BURST_OFFSET_METRES).position;
        castKitSummon(kitEffectState, body, combatant, kameraHits);
        // The cast heal reaches the whole deployed team wherever it stands, whatever the burst strikes
        scheduleKitTask(kitEffectState, characterId, burstHitmarkSeconds, (tick) =>
          healTeam(tick, combatant, stillPhotoFlatHealth, stillPhotoAttackShare),
        );
        // Each Kamera tick heals the character on the field while it stands in the circle the burst was cast at
        for (const { hitmarkSeconds } of kameraHits)
          castKitField(kitEffectState, characterId, castCentre, {
            nextTickSeconds: hitmarkSeconds,
            onTick: (tick) =>
              changeKitMemberHealth(
                tick,
                combatant,
                tick.activeCombatant.characterId,
                kameraFlatHealth + kameraAttackShare * combatant.attributes.attack,
              ),
            radius: BURST_HEAL_RADIUS,
            secondsRemaining: hitmarkSeconds + SUMMON_LINGER_SECONDS,
            tickIntervalSeconds: 1,
          });
      },
    },
    // Spiritbreath Thorn is opened as the charged attack starts on a target, and its field strikes after the charged
    // Attack's hit, where the target stood then, unless the thorn is still on its cooldown
    chargedAttack: {
      onStart: ({ activeCombatant: combatant, kitEffectState }, target) => {
        if (!target) return;
        const { characterId } = combatant;
        const { position } = target;
        const thornBody: KitBody = { facing: 0, height: 0, position: { x: position.x, z: position.z } };
        scheduleKitTask(kitEffectState, characterId, thornHitmarkSeconds, ({ kitEffectState: effectState }) => {
          if (!startKitCooldown(effectState, characterId, THORN_COOLDOWN_STATUS_ID, thornCooldownSeconds)) return;
          castKitSummon(effectState, thornBody, combatant, [thorn]);
        });
      },
    },
    // Each Snappy Silhouette tick is a hit on the enemy it ticks on
    onKitEvent: (event, { kitEffectState }, combatant) => {
      if (event.kind !== KitEventKind.StatusTicked || event.status.id !== SNAPPY_MARK_STATUS_ID) return;
      const { enemy } = event;
      castKitSummon(
        kitEffectState,
        { facing: 0, height: 0, position: { x: enemy.position.x, z: enemy.position.z } },
        combatant,
        [snappyMarkHit],
        { target: enemy },
      );
    },
    // Framing's press and its hold share the press's Snappy Silhouette marks. The hold's Focused Impression is not built
    // Yet, as its hit falls a held duration later, which a skill's fixed hold levels cannot give (see the character's
    // Page)
    skill: {
      hits: [
        {
          enemyStatus: () => {
            markedCount++;
            return markedCount <= SNAPPY_MARK_CAP ? createSnappyMark() : undefined;
          },
        },
      ],
      onStart: () => {
        markedCount = 0;
      },
    },
  };
};
