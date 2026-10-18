import type { Enemy } from "#src/models/enemy/Enemy";
import type { Combatant } from "#src/models/kit/Combatant";
import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitHit } from "#src/models/kit/KitHit";
import type { KitRecordReader } from "#src/models/kit/KitRecordReader";

import { AttackTag } from "#src/models/combat/AttackTag";
import { Element } from "#src/models/Element";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { addEnemyStatus } from "#src/services/enemy/addEnemyStatus";
import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { castKitSummon } from "#src/services/kit/effects/castKitSummon";
import { enterKitStance } from "#src/services/kit/effects/enterKitStance";
import { findKitStance } from "#src/services/kit/effects/findKitStance";
import { findKitStatus } from "#src/services/kit/effects/findKitStatus";
import { scheduleKitTask } from "#src/services/kit/effects/scheduleKitTask";
import { endPartyMemberSkillCooldown } from "#src/services/party/endPartyMemberSkillCooldown";
import { gainPartyMemberEnergy } from "#src/services/party/gainPartyMemberEnergy";
import { getImpetuousWindsSkillCooldownMultiplier } from "#src/services/party/getImpetuousWindsSkillCooldownMultiplier";
import { getPartyMember } from "#src/services/party/getPartyMember";

// Riptide on an enemy, and the strikes it sets off: Riptide Flash, a fully charged aimed shot's three hits round an enemy
// Holding it, at most once in its interval on each enemy; Riptide Slash, a Melee Stance Normal or Charged Attack's hit
// Round it, at most once in its own; Riptide Blast, Light of Obliteration's hit round it, which clears it; and Riptide
// Burst, round an enemy defeated holding it, which gives Riptide to the enemies it hits, as gcsim v2.47.2 (MIT)
// Tartaglia/riptide.go sets them off
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/tartaglia/riptide.go
const RIPTIDE_STATUS_ID = "tartaglia-riptide";
const RIPTIDE_FLASH_COOLDOWN_STATUS_ID = "tartaglia-riptide-flash-cooldown";
const RIPTIDE_SLASH_COOLDOWN_STATUS_ID = "tartaglia-riptide-slash-cooldown";

// Never Ending, from Ascension 1: Riptide lasts 8 seconds longer
const NEVER_ENDING_ASCENSION = 1;
const NEVER_ENDING_SECONDS = 8;
// Sword of Torrents, from Ascension 4: a CRIT hit of a Melee Stance Normal or Charged Attack gives the enemy Riptide
const SWORD_OF_TORRENTS_ASCENSION = 4;
// Foul Legacy: Tide Withholder, from one constellation: the stance's cooldown is cut by 20%
const TIDE_WITHHOLDER_CONSTELLATION = 1;
const TIDE_WITHHOLDER_COOLDOWN_MULTIPLIER = 0.8;
// Foul Legacy: Understream, from two constellations: an enemy defeated holding Riptide gives Tartaglia 4 energy
const UNDERSTREAM_CONSTELLATION = 2;
const UNDERSTREAM_ENERGY = 4;
// Abyssal Mayhem: Hydrospout, from four constellations: each enemy holding Riptide takes a Riptide Slash in the Melee
// Stance, or a Riptide Flash out of it, every 3.9 seconds as gcsim v2.47.2 (MIT) tartaglia/riptide.go measures the
// Game's 4, outside the intervals the two keep
// https://genshin-impact.fandom.com/wiki/Abyssal_Mayhem:_Hydrospout
const HYDROSPOUT_CONSTELLATION = 4;
const HYDROSPOUT_INTERVAL_SECONDS = 3.9;
// Havoc: Annihilation, from six constellations: the burst cast in the Melee Stance ends the stance's cooldown as it ends
const HAVOC_ANNIHILATION_CONSTELLATION = 6;
const HAVOC_ANNIHILATION_STATUS_ID = "tartaglia-havoc-annihilation";

// A strike Riptide sets off on an enemy, landing round it from Tartaglia as he stands
const strikeRiptide = (kitEffectState: KitEffectState, enemy: Enemy, combatant: Combatant, hits: KitHit[]): void => {
  castKitSummon(kitEffectState, { facing: 0, height: 0, position: enemy.position }, combatant, hits);
};

export const TARTAGLIA_CHARACTER_ID = 10_000_033;

// Tartaglia's behaviour: Foul Legacy: Raging Tide's change into the Melee Stance, ending on a press back, at its longest
// Or as he leaves the field, its cooldown following the seconds it held, and Havoc: Obliteration's Flash of Havoc in the
// Ranged Stance, landing on the enemy he turned to and giving energy back, or Light of Obliteration in the Melee Stance.
// Riptide, its strikes, the passives and the constellations answer the kit's events. Master of Weaponry is not built, as
// No kit reads a talent level, and the Melee Stance's plunges are not refused
export const createTartagliaKitBehaviour = ({
  readHit,
  readHits,
  readParameter,
  readSeconds,
  readStance,
}: KitRecordReader): KitBehaviour => {
  const riptideSeconds = readParameter("riptideSeconds");
  const stanceSeconds = readParameter("stanceSeconds");
  const stanceCooldownSeconds = readParameter("stanceCooldownSeconds");
  const longestStanceCooldownSeconds = readParameter("longestStanceCooldownSeconds");
  const flashOfHavocEnergy = readParameter("flashOfHavocEnergyReturn");
  const flashOfHavocEnergySeconds = readSeconds("flashOfHavocEnergy");
  const riptideFlashCooldownSeconds = readSeconds("riptideFlashCooldown");
  const riptideSlashCooldownSeconds = readSeconds("riptideSlashCooldown");
  const riptideFlashHits = readHits("riptideFlash");
  const hydrospoutFlashHits = readHits("hydrospoutFlash");
  const riptideSlashHit = readHit("riptideSlash");
  const riptideBlastHit = readHit("riptideBlast");
  const riptideBurstHit = readHit("riptideBurst");
  const flashOfHavocHit = readHit("flashOfHavoc");
  // The Melee Stance's strikes are Normal Attack DMG and its charged attack Charged Attack DMG, gcsim's AttackTagNormal
  // In tartaglia/attack.go's meleeAttack and AttackTagExtra in tartaglia/charge.go's ChargeAttack
  const meleeStanceActions = readStance("meleeStance", {
    // Light of Obliteration lands round the body, and from six constellations it marks the stance's end to end the
    // Stance's cooldown
    burst: {
      onStart: ({ activeCombatant: { characterId, constellationCount }, kitEffectState }) => {
        if (constellationCount >= HAVOC_ANNIHILATION_CONSTELLATION)
          addKitStatus(kitEffectState, characterId, {
            id: HAVOC_ANNIHILATION_STATUS_ID,
            secondsRemaining: stanceSeconds,
          });
      },
    },
    // A press back to the Ranged Stance ends the stance, whose end sets the skill's cooldown
    skill: {
      onStart: ({ activeCombatant: combatant, kitEffectState }) => {
        const stance = findKitStance(kitEffectState.effects, combatant.characterId);
        if (stance) stance.secondsRemaining = 0;
      },
    },
  });
  const [lightOfObliterationHit] = meleeStanceActions.elementalBurst.hits;
  // Riptide on an enemy for its seconds, 8 longer from Ascension 1, ticking Hydrospout from four constellations. A
  // Refresh keeps the schedule its ticks already hold
  const applyRiptide = (enemy: Enemy, { ascension, constellationCount }: Combatant): void =>
    addEnemyStatus(enemy, {
      damageTakenBonus: 0,
      id: RIPTIDE_STATUS_ID,
      secondsRemaining: riptideSeconds + (ascension >= NEVER_ENDING_ASCENSION ? NEVER_ENDING_SECONDS : 0),
      ...(constellationCount >= HYDROSPOUT_CONSTELLATION && {
        nextTickSeconds: HYDROSPOUT_INTERVAL_SECONDS,
        tickIntervalSeconds: HYDROSPOUT_INTERVAL_SECONDS,
      }),
    });
  return {
    // Flash of Havoc lands on the enemy the body turned to, or round the body with none, and gives energy back
    burst: {
      onStart: ({ activeCombatant: combatant, body, kitEffectState }, target) => {
        castKitSummon(
          kitEffectState,
          { facing: body.facing, height: body.height, position: target?.position ?? body.position },
          combatant,
          [flashOfHavocHit],
        );
        scheduleKitTask(kitEffectState, combatant.characterId, flashOfHavocEnergySeconds, ({ party }) =>
          gainPartyMemberEnergy(party, combatant, flashOfHavocEnergy),
        );
      },
    },
    // The end of the Melee Stance, which leaving the field brings, sets the skill's cooldown by the whole seconds it
    // Held, or its longest cooldown once it held its longest, cut from one constellation, or ends the cooldown from six
    // Once the burst was cast in it. Hydrospout's tick sets off a Slash in the Melee Stance or a Flash out of it, outside
    // Their intervals, and each hit Tartaglia lands gives and sets off Riptide
    onKitEvent: (event, { kitEffectState, party }, combatant) => {
      const { ascension, characterId, constellationCount } = combatant;
      const meleeStance = findKitStance(kitEffectState.effects, characterId);
      if (event.kind === KitEventKind.EffectExpired) {
        const { effect } = event;
        if (effect.kind !== "stance" || effect.characterId !== characterId) return;
        const partyMember = getPartyMember(party, characterId);
        const havocAnnihilation = findKitStatus(kitEffectState.effects, characterId, HAVOC_ANNIHILATION_STATUS_ID);
        if (havocAnnihilation) {
          havocAnnihilation.secondsRemaining = 0;
          endPartyMemberSkillCooldown(party, characterId);
          return;
        }

        partyMember.skillCooldownSeconds =
          (effect.elapsedSeconds >= stanceSeconds
            ? longestStanceCooldownSeconds
            : stanceCooldownSeconds + Math.floor(effect.elapsedSeconds)) *
          (constellationCount >= TIDE_WITHHOLDER_CONSTELLATION ? TIDE_WITHHOLDER_COOLDOWN_MULTIPLIER : 1) *
          getImpetuousWindsSkillCooldownMultiplier(combatant.elementalResonances);
        return;
      }

      if (event.kind === KitEventKind.StatusTicked) {
        const { enemy, status } = event;
        if (status.id === RIPTIDE_STATUS_ID && constellationCount >= HYDROSPOUT_CONSTELLATION)
          strikeRiptide(kitEffectState, enemy, combatant, meleeStance ? [riptideSlashHit] : hydrospoutFlashHits);
        return;
      }

      if (event.kind !== KitEventKind.DamageTaken) return;
      const { attackTag, enemy, hit, isCritical, isDefeated, striker } = event;
      const checkHasEnemyStatus = (statusId: string): boolean => enemy.statuses.some(({ id }) => id === statusId);
      const hadRiptide = checkHasEnemyStatus(RIPTIDE_STATUS_ID);
      let hasRiptide = hadRiptide;
      let isRiptideApplied = false;
      if (striker.characterId === characterId) {
        // Riptide Blast clears Riptide as Light of Obliteration hits, unless a Riptide Slash's interval holds it
        if (hit === lightOfObliterationHit && hasRiptide && !checkHasEnemyStatus(RIPTIDE_SLASH_COOLDOWN_STATUS_ID)) {
          enemy.statuses = enemy.statuses.filter(({ id }) => id !== RIPTIDE_STATUS_ID);
          hasRiptide = false;
          strikeRiptide(kitEffectState, enemy, combatant, [riptideBlastHit]);
        }

        const isAimedShot = !meleeStance && attackTag === AttackTag.ChargedAttack && hit.element === Element.Hydro;
        const isMeleeAttack =
          meleeStance !== undefined && (attackTag === AttackTag.NormalAttack || attackTag === AttackTag.ChargedAttack);
        // A fully charged aimed shot sets off Riptide Flash on Riptide the enemy held before it
        if (isAimedShot && hasRiptide && !checkHasEnemyStatus(RIPTIDE_FLASH_COOLDOWN_STATUS_ID)) {
          addEnemyStatus(enemy, {
            damageTakenBonus: 0,
            id: RIPTIDE_FLASH_COOLDOWN_STATUS_ID,
            secondsRemaining: riptideFlashCooldownSeconds,
          });
          strikeRiptide(kitEffectState, enemy, combatant, riptideFlashHits);
        }

        if (
          isAimedShot ||
          hit === flashOfHavocHit ||
          hit === riptideBurstHit ||
          (isMeleeAttack && isCritical && ascension >= SWORD_OF_TORRENTS_ASCENSION)
        ) {
          applyRiptide(enemy, combatant);
          hasRiptide = true;
          isRiptideApplied = true;
        }
        // A Melee Stance attack sets off Riptide Slash on Riptide, even Riptide the same hit gave
        if (isMeleeAttack && hasRiptide && !checkHasEnemyStatus(RIPTIDE_SLASH_COOLDOWN_STATUS_ID)) {
          addEnemyStatus(enemy, {
            damageTakenBonus: 0,
            id: RIPTIDE_SLASH_COOLDOWN_STATUS_ID,
            secondsRemaining: riptideSlashCooldownSeconds,
          });
          strikeRiptide(kitEffectState, enemy, combatant, [riptideSlashHit]);
        }
      }
      // An enemy defeated holding Riptide, or by the hit that gave it Riptide, bursts, and gives energy from two
      // Constellations
      if (!isDefeated || (!hadRiptide && !isRiptideApplied)) return;
      strikeRiptide(kitEffectState, enemy, combatant, [riptideBurstHit]);
      if (constellationCount >= UNDERSTREAM_CONSTELLATION) gainPartyMemberEnergy(party, combatant, UNDERSTREAM_ENERGY);
    },
    // The stance change's hit lands round the body, and the Melee Stance holds from the press
    skill: {
      onStart: ({ activeCombatant: combatant, kitEffectState }) =>
        enterKitStance(kitEffectState, combatant, meleeStanceActions, stanceSeconds, { isEndedOnSwap: true }),
    },
  };
};
