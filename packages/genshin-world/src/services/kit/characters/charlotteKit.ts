import type { Enemy } from "#src/models/enemy/Enemy";
import type { EnemyStatus } from "#src/models/enemy/EnemyStatus";
import type { Combatant } from "#src/models/kit/Combatant";
import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitBody } from "#src/models/kit/KitBody";
import type { KitContext } from "#src/models/kit/KitContext";
import type { KitEffect } from "#src/models/kit/KitEffect";
import type { KitHitBehaviour } from "#src/models/kit/KitHitBehaviour";
import type { KitRecordReader } from "#src/models/kit/KitRecordReader";

import { Attribute } from "#src/models/character/Attribute";
import { AttackTag } from "#src/models/combat/AttackTag";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { SUMMON_LINGER_SECONDS } from "#src/services/kit/constants";
import { createAheadBody } from "#src/services/kit/createAheadBody";
import { createKitBody } from "#src/services/kit/createKitBody";
import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { buffKitMember } from "#src/services/kit/effects/buffKitMember";
import { castKitField } from "#src/services/kit/effects/castKitField";
import { castKitSummon } from "#src/services/kit/effects/castKitSummon";
import { changeKitMemberHealth } from "#src/services/kit/effects/changeKitMemberHealth";
import { findKitStatus } from "#src/services/kit/effects/findKitStatus";
import { scheduleKitTask } from "#src/services/kit/effects/scheduleKitTask";
import { schedulePeriodicKitTask } from "#src/services/kit/effects/schedulePeriodicKitTask";
import { startKitCooldown } from "#src/services/kit/effects/startKitCooldown";
import { gainPartyMemberEnergy } from "#src/services/party/gainPartyMemberEnergy";
import { getDeployedCharacterIds } from "#src/services/party/getDeployedCharacterIds";
import { takeOne } from "@esposter/shared";

export const CHARLOTTE_CHARACTER_ID = 10_000_088;

// Ascension 4's bonus per other member, Healing Bonus for each from Fontaine and Cryo DMG Bonus for each from outside it, as
// Gcsim (MIT) charlotte/asc.go gives it. The region a member is from is the catalogue region its association names
const ASCENSION_4 = 4;
const ASCENSION_4_BONUS_PER_MEMBER = 0.05;
const FONTAINE_REGION_ID = "fontaine";

// Spiritbreath Thorn's cooldown starts when it strikes, as gcsim (MIT) charlotte/charge.go gives it
// https://github.com/genshinsim/gcsim/tree/v2.47.2/internal/characters/charlotte
const THORN_COOLDOWN_STATUS_ID = "charlotte-thorn-cooldown";

// Framing's press marks each enemy it strikes with Snappy Silhouette, ticking every 1.5 seconds from the mark, and no more
// Than five enemies a cast, as gcsim (MIT) charlotte/skill.go gives it
// https://github.com/genshinsim/gcsim/tree/v2.47.2/internal/characters/charlotte
const SNAPPY_MARK_STATUS_ID = "charlotte-snappy-silhouette";
const SNAPPY_MARK_INTERVAL_SECONDS = 1.5;
const SNAPPY_MARK_CAP = 5;

// Constellations 1, 2 and 4, as gcsim (MIT) charlotte/cons.go gives them. Constellation 1 heals a member one of her heals
// Lands on, at once and every two seconds for six, for 80% of her ATK. Constellation 2 raises her ATK by 10% for each of
// The press's first three hits on an enemy, for 12 seconds. Constellation 4 raises her burst's hits on an enemy the press
// Marked by 10% DMG, five times in 20 seconds from the first, and gives her 2 energy for each
// https://github.com/genshinsim/gcsim/tree/v2.47.2/internal/characters/charlotte
const CONSTELLATION_1 = 1;
const CONSTELLATION_1_STATUS_ID = "charlotte-constellation-1";
const CONSTELLATION_1_HEAL_ATTACK_SHARE = 0.8;
const CONSTELLATION_1_SECONDS = 6;
const CONSTELLATION_1_INTERVAL_SECONDS = 2;
const CONSTELLATION_2 = 2;
const CONSTELLATION_2_ATTACK_SHARE_PER_HIT = 0.1;
const CONSTELLATION_2_MAX_HITS = 3;
const CONSTELLATION_2_SECONDS = 12;
const CONSTELLATION_2_SOURCE = "charlotte-constellation-2";
const CONSTELLATION_4 = 4;
const CONSTELLATION_4_DAMAGE_BONUS = 0.1;
const CONSTELLATION_4_MAX_HITS = 5;
const CONSTELLATION_4_SECONDS = 20;
const CONSTELLATION_4_STATUS_ID = "charlotte-constellation-4";
const CONSTELLATION_4_ENERGY = 2;

// Whether an enemy carries Framing's press mark, which Constellation 4 reads
const checkIsSnappyMarked = (enemy: Enemy): boolean => enemy.statuses.some(({ id }) => id === SNAPPY_MARK_STATUS_ID);

// The burst hits Constellation 4 has counted in its window, which its status holds as the stacks
const countConstellation4Hits = (effects: readonly KitEffect[], characterId: number): number =>
  findKitStatus(effects, characterId, CONSTELLATION_4_STATUS_ID)?.stacks ?? 0;

// Each Kamera tick heals the character on the field while it stands within a circle of radius 7 round the point Still
// Photo was cast at, 4.5 metres ahead of the body, as gcsim (MIT) charlotte/burst.go gives it
// https://github.com/genshinsim/gcsim/tree/v2.47.2/internal/characters/charlotte
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
// Field within the circle it was cast at. Constellations 1, 2 and 4 are built, each on the press's marks or hits and the
// Heals her own heals land on. Constellation 4 reads the press's marks alone, as the hold's Focused Impression is not
// Built, and Constellation 2 counts the press's hits alone for the same reason. Constellation 6 needs the hold's
// Focused Impression mark, which is not built, and the active character's hits on it
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
  // Constellation 4 counts each burst hit that lands on an enemy the press marked, and gives energy for it, as gcsim's
  // `OnEnemyHit` does for each of the burst's initial hit and its Kamera ticks
  const burstHitBehaviour: KitHitBehaviour = {
    onStrike: ({ kitEffectState, party }, { combatant }, enemy) => {
      if (combatant.constellationCount < CONSTELLATION_4 || !checkIsSnappyMarked(enemy)) return;
      const hitCount = countConstellation4Hits(kitEffectState.effects, combatant.characterId);
      if (hitCount >= CONSTELLATION_4_MAX_HITS) return;
      const counter = findKitStatus(kitEffectState.effects, combatant.characterId, CONSTELLATION_4_STATUS_ID);
      if (counter) counter.stacks = hitCount + 1;
      else
        addKitStatus(kitEffectState, combatant.characterId, {
          id: CONSTELLATION_4_STATUS_ID,
          secondsRemaining: CONSTELLATION_4_SECONDS,
          stacks: 1,
        });
      gainPartyMemberEnergy(party, combatant, CONSTELLATION_4_ENERGY);
    },
  };
  const kameraHits = readHits("kamera", burstHitBehaviour);
  const burstStrikeHits = new Set([...kit.elementalBurst.hits, ...kameraHits]);
  const burstHitmarkSeconds = takeOne(kit.elementalBurst.hits).hitmarkSeconds;
  const stillPhotoFlatHealth = readParameter("stillPhotoFlatHealth");
  const stillPhotoAttackShare = readParameter("stillPhotoAttackShare");
  const kameraFlatHealth = readParameter("kameraFlatHealth");
  const kameraAttackShare = readParameter("kameraAttackShare");
  // The marks Framing's press puts on the enemies it strikes: a cast marks the first five, and a tick is a hit on that
  // Enemy alone. The count is reset as each press starts, so it counts the enemies of the press that is landing
  let markedCount = 0;
  // The press's hits on enemies so far, which Constellation 2 counts up to three, from the press's start
  let pressHitCount = 0;
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
      hits: [burstHitBehaviour],
      onStart: ({ activeCombatant: combatant, body, kitEffectState }) => {
        const { characterId } = combatant;
        const castCentre = createAheadBody(body, BURST_OFFSET_METRES).position;
        castKitSummon(kitEffectState, body, combatant, kameraHits, { attackTag: AttackTag.ElementalBurst });
        // The cast heal reaches the whole deployed team wherever it stands, whatever the burst strikes
        scheduleKitTask(kitEffectState, characterId, burstHitmarkSeconds, (tick) => {
          healTeam(tick, combatant, stillPhotoFlatHealth, stillPhotoAttackShare);
        });
        // Each Kamera tick heals the character on the field while it stands in the circle the burst was cast at
        for (const { hitmarkSeconds } of kameraHits)
          castKitField(kitEffectState, characterId, castCentre, {
            nextTickSeconds: hitmarkSeconds,
            onTick: (tick) => {
              changeKitMemberHealth(
                tick,
                combatant,
                tick.activeCombatant.characterId,
                kameraFlatHealth + kameraAttackShare * combatant.attributes.attack,
              );
            },
            radius: BURST_HEAL_RADIUS,
            secondsRemaining: hitmarkSeconds + SUMMON_LINGER_SECONDS,
            tickIntervalSeconds: 1,
          });
      },
    },
    // Spiritbreath Thorn is opened as the charged attack starts on a target, and its field strikes after the charged
    // Attack's hit, round the point the target stood at when the attack started, as gcsim (MIT) charlotte/charge.go
    // Takes it, not where the target stands at the hit, unless the thorn is still on its cooldown
    chargedAttack: {
      onStart: ({ activeCombatant: combatant, kitEffectState }, target) => {
        if (!target) return;
        const { characterId } = combatant;
        const { position } = target;
        const thornBody: KitBody = createKitBody({ x: position.x, z: position.z });
        scheduleKitTask(kitEffectState, characterId, thornHitmarkSeconds, ({ kitEffectState: effectState }) => {
          if (!startKitCooldown(effectState, characterId, THORN_COOLDOWN_STATUS_ID, thornCooldownSeconds)) return;
          castKitSummon(effectState, thornBody, combatant, [thorn], { attackTag: AttackTag.ChargedAttack });
        });
      },
    },
    getPassiveBonuses: (combatant, _healthShare, deployedCombatants) => {
      if (combatant.ascension < ASCENSION_4) return [];
      const otherMembers = deployedCombatants.filter(({ characterId }) => characterId !== combatant.characterId);
      const fontaineCount = otherMembers.filter(({ regionId }) => regionId === FONTAINE_REGION_ID).length;
      return [
        { amount: ASCENSION_4_BONUS_PER_MEMBER * fontaineCount, attribute: Attribute.HealingBonus },
        {
          amount: ASCENSION_4_BONUS_PER_MEMBER * (otherMembers.length - fontaineCount),
          attribute: Attribute.CryoDamageBonus,
        },
      ];
    },
    getStrikeDamageBonus: ({ combatant, hit }, enemy, _party, effects) =>
      combatant.constellationCount >= CONSTELLATION_4 &&
      burstStrikeHits.has(hit) &&
      checkIsSnappyMarked(enemy) &&
      countConstellation4Hits(effects, combatant.characterId) < CONSTELLATION_4_MAX_HITS
        ? CONSTELLATION_4_DAMAGE_BONUS
        : 0,
    // Each Snappy Silhouette tick is a hit on the enemy it ticks on. Each heal Charlotte's own heal lands on starts
    // Constellation 1 on the member it heals, which heals it at once and every two seconds for six
    onKitEvent: (event, context, combatant) => {
      const { kitEffectState } = context;
      if (event.kind === KitEventKind.HealthChanged) {
        if (combatant.constellationCount < CONSTELLATION_1 || event.sourceCharacterId !== combatant.characterId) return;
        const healedCharacterId = event.characterId;
        if (!startKitCooldown(kitEffectState, healedCharacterId, CONSTELLATION_1_STATUS_ID, CONSTELLATION_1_SECONDS))
          return;
        const healAmount = CONSTELLATION_1_HEAL_ATTACK_SHARE * combatant.attributes.attack;
        changeKitMemberHealth(context, combatant, healedCharacterId, healAmount);
        schedulePeriodicKitTask(
          kitEffectState,
          combatant.characterId,
          {
            firstSeconds: CONSTELLATION_1_INTERVAL_SECONDS,
            intervalSeconds: CONSTELLATION_1_INTERVAL_SECONDS,
            untilSeconds: CONSTELLATION_1_SECONDS,
          },
          (tick) => {
            changeKitMemberHealth(tick, combatant, healedCharacterId, healAmount);
          },
        );
        return;
      }
      if (event.kind !== KitEventKind.StatusTicked || event.status.id !== SNAPPY_MARK_STATUS_ID) return;
      const { enemy } = event;
      castKitSummon(
        kitEffectState,
        createKitBody({ x: enemy.position.x, z: enemy.position.z }),
        combatant,
        [snappyMarkHit],
        { attackTag: AttackTag.ElementalSkill, target: enemy },
      );
    },
    // Framing's press and its hold share the press's Snappy Silhouette marks. The hold's Focused Impression is not
    // Built Yet, as its hit falls a held duration later, which a skill's fixed hold levels cannot give (see its Page)
    skill: {
      hits: [
        {
          enemyStatus: () => {
            markedCount++;
            return markedCount <= SNAPPY_MARK_CAP ? createSnappyMark() : undefined;
          },
          onStrike: ({ kitEffectState }, { combatant }) => {
            if (combatant.constellationCount < CONSTELLATION_2 || pressHitCount >= CONSTELLATION_2_MAX_HITS) return;
            pressHitCount++;
            buffKitMember(kitEffectState, combatant.characterId, {
              amount: CONSTELLATION_2_ATTACK_SHARE_PER_HIT * pressHitCount,
              attribute: Attribute.AttackPercent,
              secondsRemaining: CONSTELLATION_2_SECONDS,
              source: CONSTELLATION_2_SOURCE,
            });
          },
        },
      ],
      onStart: () => {
        markedCount = 0;
        pressHitCount = 0;
      },
    },
  };
};
