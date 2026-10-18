import type { Combatant } from "#src/models/kit/Combatant";
import type { KitActionBehaviour } from "#src/models/kit/KitActionBehaviour";
import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitBody } from "#src/models/kit/KitBody";
import type { KitBuff } from "#src/models/kit/KitBuff";
import type { KitContext } from "#src/models/kit/KitContext";
import type { KitEffect } from "#src/models/kit/KitEffect";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitField } from "#src/models/kit/KitField";
import type { KitHitBehaviour } from "#src/models/kit/KitHitBehaviour";
import type { KitRecordReader } from "#src/models/kit/KitRecordReader";
import type { KitStrike } from "#src/models/kit/KitStrike";

import { Attribute } from "#src/models/character/Attribute";
import { InternalCooldownTag } from "#src/models/combat/InternalCooldownTag";
import { Element } from "#src/models/Element";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { KitPlunge } from "#src/models/kit/record/KitPlunge";
import { addKitEffect } from "#src/services/kit/effects/addKitEffect";
import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { buffKitMember } from "#src/services/kit/effects/buffKitMember";
import { castKitField } from "#src/services/kit/effects/castKitField";
import { castKitSummon } from "#src/services/kit/effects/castKitSummon";
import { changeKitSkillCooldown } from "#src/services/kit/effects/changeKitSkillCooldown";
import { findKitStatus } from "#src/services/kit/effects/findKitStatus";
import { scheduleKitTask } from "#src/services/kit/effects/scheduleKitTask";
import { startKitCooldown } from "#src/services/kit/effects/startKitCooldown";
import { getDeployedCharacterIds } from "#src/services/party/getDeployedCharacterIds";
import { takeOne } from "@esposter/shared";

// Measured: gcsim (MIT) alhaitham/asc.go and cons.go, Ascension 1 makes a Mirror from a charged attack's or a plunge's hit
// On an enemy once every 12 seconds, and Ascension 4 raises a Projection Attack's and the burst's DMG by 0.1% per Elemental
// Mastery, to 100%. Constellation 2 gives 50 Elemental Mastery for 8 seconds for each Mirror made, up to four, Constellation
// 4 gives the team 30 Elemental Mastery per Mirror the burst consumed for 15 seconds and Alhaitham 10% Dendro DMG per Mirror
// Made for as long, and Constellation 6 gives 10% CRIT Rate and 70% CRIT DMG for 6 seconds on each Mirror past three, which
// Each further one extends by 6 seconds
const ASCENSION_1 = 1;
const ASCENSION_4 = 4;
const CONSTELLATION_1 = 1;
const CONSTELLATION_1_CUT_SECONDS = 1.2;
const CONSTELLATION_1_ICD_SECONDS = 1;
const CONSTELLATION_1_ICD_STATUS_ID = "alhaitham-c1-cut-icd";
const CONSTELLATION_2 = 2;
const CONSTELLATION_4 = 4;
const CONSTELLATION_6 = 6;
// A stance, status or infusion a kit holds until a swap ends it, as gcsim's Mirrors last while he stays on the field
const HELD_UNTIL_SWAP_SECONDS = Number.POSITIVE_INFINITY;
const MIRROR_STATUS_ID = "alhaitham-mirrors";
const MIRROR_DECAY_FIELD_ID = "alhaitham-mirror-decay";
const MIRROR_REGEN_TASK_ID = "alhaitham-mirror-regen";
const PROJECTION_ICD_STATUS_ID = "alhaitham-projection-icd";
const ASCENSION_1_ICD_STATUS_ID = "alhaitham-a1-icd";
const CONSTELLATION_2_CURSOR_STATUS_ID = "alhaitham-c2-cursor";
const CONSTELLATION_2_SOURCE_PREFIX = "alhaitham-c2-";
const CONSTELLATION_4_LOSS_SOURCE = "alhaitham-c4-loss";
const CONSTELLATION_4_GAIN_SOURCE = "alhaitham-c4-gain";
const CONSTELLATION_6_SOURCE = "alhaitham-c6";

// The field of an id the team holds
const findKitField = (effects: readonly KitEffect[], id: string): KitField | undefined =>
  effects.find((effect): effect is KitField => effect.kind === "field" && effect.id === id);
const findKitBuff = (
  effects: readonly KitEffect[],
  characterId: number,
  attribute: Attribute,
  source: string,
): KitBuff | undefined =>
  effects.find(
    (effect): effect is KitBuff =>
      effect.kind === "buff" &&
      effect.characterId === characterId &&
      effect.attribute === attribute &&
      effect.source === source,
  );
const getMirrorCount = (effects: readonly KitEffect[], characterId: number): number =>
  findKitStatus(effects, characterId, MIRROR_STATUS_ID)?.stacks ?? 0;

// Sets the Mirrors a character holds, with the Dendro infusion of its normal attacks, charged attack and plunges while it holds
// Any. Zero ends the Mirrors, their decay and that infusion, as a swap or the burst's consumption does
const setMirrorCount = (kitEffectState: KitEffectState, characterId: number, mirrors: number): void => {
  if (mirrors <= 0) {
    const status = findKitStatus(kitEffectState.effects, characterId, MIRROR_STATUS_ID);
    if (status) {
      status.stacks = 0;
      status.secondsRemaining = 0;
    }
    for (const effect of kitEffectState.effects) {
      if (effect.kind === "infusion" && effect.characterId === characterId && effect.element === Element.Dendro)
        effect.secondsRemaining = 0;
      if (effect.kind === "field" && effect.id === MIRROR_DECAY_FIELD_ID) effect.secondsRemaining = 0;
    }
    return;
  }
  addKitStatus(kitEffectState, characterId, {
    id: MIRROR_STATUS_ID,
    secondsRemaining: HELD_UNTIL_SWAP_SECONDS,
    stacks: mirrors,
  });
  addKitEffect(kitEffectState, {
    characterId,
    element: Element.Dendro,
    kind: "infusion",
    secondsRemaining: HELD_UNTIL_SWAP_SECONDS,
  });
};

// The constellation values the buffs of Constellations 2 and 6 are made from, read from the record
interface ConstellationBuffs {
  constellation2ElementalMastery: number;
  constellation2Seconds: number;
  constellation2StacksMax: number;
  constellation6CriticalDamage: number;
  constellation6CriticalRate: number;
  constellation6Seconds: number;
}

// Adds Constellation 2's Elemental Mastery for one Mirror made, on the next of its four sources, as gcsim cycles them
const addConstellation2Buff = (
  kitEffectState: KitEffectState,
  characterId: number,
  buffs: ConstellationBuffs,
): void => {
  const cursor = findKitStatus(kitEffectState.effects, characterId, CONSTELLATION_2_CURSOR_STATUS_ID)?.stacks ?? 0;
  addKitStatus(kitEffectState, characterId, {
    id: CONSTELLATION_2_CURSOR_STATUS_ID,
    secondsRemaining: HELD_UNTIL_SWAP_SECONDS,
    stacks: (cursor + 1) % buffs.constellation2StacksMax,
  });
  buffKitMember(kitEffectState, characterId, {
    amount: buffs.constellation2ElementalMastery,
    attribute: Attribute.ElementalMastery,
    secondsRemaining: buffs.constellation2Seconds,
    source: `${CONSTELLATION_2_SOURCE_PREFIX}${cursor + 1}`,
  });
};

// Adds Constellation 6's CRIT for each Mirror past three, where a further one extends the buff already on him
const addConstellation6Buffs = (
  kitEffectState: KitEffectState,
  characterId: number,
  overflow: number,
  buffs: ConstellationBuffs,
): void => {
  for (let index = 0; index < overflow; index++) {
    const critical = findKitBuff(kitEffectState.effects, characterId, Attribute.CriticalRate, CONSTELLATION_6_SOURCE);
    if (critical) {
      critical.secondsRemaining += buffs.constellation6Seconds;
      const criticalDamage = findKitBuff(
        kitEffectState.effects,
        characterId,
        Attribute.CriticalDamage,
        CONSTELLATION_6_SOURCE,
      );
      if (criticalDamage) criticalDamage.secondsRemaining += buffs.constellation6Seconds;
      continue;
    }
    buffKitMember(kitEffectState, characterId, {
      amount: buffs.constellation6CriticalRate,
      attribute: Attribute.CriticalRate,
      secondsRemaining: buffs.constellation6Seconds,
      source: CONSTELLATION_6_SOURCE,
    });
    buffKitMember(kitEffectState, characterId, {
      amount: buffs.constellation6CriticalDamage,
      attribute: Attribute.CriticalDamage,
      secondsRemaining: buffs.constellation6Seconds,
      source: CONSTELLATION_6_SOURCE,
    });
  }
};

// The Elemental Mastery a hit's flat damage takes, from its striker's total at the multiplier
const elementalMasteryMultiplier = (combatant: Combatant, multiplier: number): number =>
  combatant.attributes.attributeTotalMap[Attribute.ElementalMastery] * multiplier;

// The Mirrors a skill makes as it lands: two when the character holds none, and one otherwise
const getSkillMirrorGain = (effects: readonly KitEffect[], characterId: number): number =>
  getMirrorCount(effects, characterId) === 0 ? 2 : 1;

export const ALHAITHAM_CHARACTER_ID = 10_000_078;

// Alhaitham's behaviour: Universality: An Elaboration on Form's tap and hold and Particular Field: Fetters of Phenomena make
// The Mirrors, which infuse his attacks with Dendro and decay one at a time, and while he holds any, a hit of his normal
// Attacks, charged attack or plunges sets off a Projection Attack. The burst consumes them for its extra hits. Ascension 1
// And 4 and Constellations 1, 2, 4 and 6 are built, Constellation 1's cut of Universality's running cooldown on a Projection
// Attack's hit among them, and the low plunge after the hold is not, as a plunge has no variant the skill's hold can set
export const createAlhaithamKitBehaviour = ({
  kit,
  readHits,
  readParameter,
  readSeconds,
  readSecondsList,
}: KitRecordReader): KitBehaviour => {
  const mirrorSecondsList = readSecondsList("universalityMirrorDelays");
  const mirrorDecaySeconds = readSeconds("mirrorDecay");
  const projectionCooldownSeconds = readSeconds("projectionAttackCooldown");
  const burstMirrorRegenSeconds = readSeconds("particularFieldMirrorDelay");
  const projectionElementalMasteryShare = readParameter("projectionAttackElementalMasteryShare");
  const burstElementalMasteryShare = readParameter("particularFieldElementalMasteryShare");
  const skillElementalMasteryShare = readParameter("universalityElementalMasteryShare");
  const mirrorsMax = readParameter("mirrorsMax");
  const burstBaseHitCount = readParameter("burstBaseHitCount");
  const burstHitCountPerMirror = readParameter("burstHitCountPerMirror");
  const ascension1IcdSeconds = readSeconds("ascension1IcdDuration");
  const ascension4DamagePerElementalMastery = readParameter("ascension4DamagePerElementalMastery");
  const ascension4DamageMax = readParameter("ascension4DamageMax");
  const constellation2ElementalMastery = readParameter("constellation2ElementalMastery");
  const constellation2Seconds = readSeconds("constellation2Duration");
  const constellation2StacksMax = readParameter("constellation2StacksMax");
  const constellation4ElementalMasteryPerMirror = readParameter("constellation4ElementalMasteryPerMirror");
  const constellation4DendroDamageBonusPerMirror = readParameter("constellation4DendroDamageBonusPerMirror");
  const constellation4Seconds = readSeconds("constellation4Duration");
  const constellation6CriticalRate = readParameter("constellation6CriticalRate");
  const constellation6CriticalDamage = readParameter("constellation6CriticalDamage");
  const constellation6Seconds = readSeconds("constellation6Duration");
  const constellationBuffs: ConstellationBuffs = {
    constellation2ElementalMastery,
    constellation2Seconds,
    constellation2StacksMax,
    constellation6CriticalDamage,
    constellation6CriticalRate,
    constellation6Seconds,
  };
  // A Projection Attack's hits are those of the Mirrors he holds as it triggers, one, two or three
  // A Projection Attack's hit cuts Universality's running cooldown by Constellation 1's seconds, once a second
  const projectionHitBehaviour: KitHitBehaviour = {
    additiveBaseDamageBonus: (striker) => elementalMasteryMultiplier(striker, projectionElementalMasteryShare),
    onStrike: ({ kitEffectState, party }, { combatant }) => {
      if (combatant.constellationCount < CONSTELLATION_1) return;
      if (
        !startKitCooldown(
          kitEffectState,
          combatant.characterId,
          CONSTELLATION_1_ICD_STATUS_ID,
          CONSTELLATION_1_ICD_SECONDS,
        )
      )
        return;
      changeKitSkillCooldown(party, combatant.characterId, -CONSTELLATION_1_CUT_SECONDS);
    },
  };
  const projectionAttacks = [
    readHits("projectionAttackOneMirror", projectionHitBehaviour),
    readHits("projectionAttackTwoMirrors", projectionHitBehaviour),
    readHits("projectionAttackThreeMirrors", projectionHitBehaviour),
  ];
  // The burst's hits, of which it strikes four plus two per Mirror consumed, each on its hitmark
  const particularFieldHits = readHits("particularFieldHits", {
    additiveBaseDamageBonus: (striker) => elementalMasteryMultiplier(striker, burstElementalMasteryShare),
  });

  // Starts the decay of the Mirrors, one each decay's seconds, or restarts it if one is running, which is gcsim's chain: a
  // New chain supersedes the one before it, so the one field is moved to its first tick rather than a second added
  const startMirrorDecay = (kitEffectState: KitEffectState, body: KitBody, combatant: Combatant): void => {
    const { characterId } = combatant;
    const field = findKitField(kitEffectState.effects, MIRROR_DECAY_FIELD_ID);
    if (field) {
      field.nextTickSeconds = mirrorDecaySeconds;
      field.secondsRemaining = HELD_UNTIL_SWAP_SECONDS;
      return;
    }
    castKitField(kitEffectState, characterId, body.position, {
      id: MIRROR_DECAY_FIELD_ID,
      nextTickSeconds: mirrorDecaySeconds,
      onTick: ({ kitEffectState: effectState }) => {
        const count = getMirrorCount(effectState.effects, characterId);
        setMirrorCount(effectState, characterId, count > 1 ? count - 1 : 0);
      },
      secondsRemaining: HELD_UNTIL_SWAP_SECONDS,
      tickIntervalSeconds: mirrorDecaySeconds,
    });
  };

  // Makes Mirrors as gcsim's mirror gain does: a run's first Mirror, or one that overflows past three, starts the decay,
  // And Constellation 2 and 6 answer each one made
  const gainMirrors = (
    kitEffectState: KitEffectState,
    body: KitBody,
    combatant: Combatant,
    generated: number,
  ): void => {
    if (generated <= 0) return;
    const { characterId, constellationCount } = combatant;
    const count = getMirrorCount(kitEffectState.effects, characterId);
    const total = count + generated;
    if (count === 0 || total > mirrorsMax) startMirrorDecay(kitEffectState, body, combatant);
    setMirrorCount(kitEffectState, characterId, Math.min(total, mirrorsMax));
    if (constellationCount >= CONSTELLATION_2)
      for (let made = 0; made < generated; made++)
        addConstellation2Buff(kitEffectState, characterId, constellationBuffs);
    if (constellationCount >= CONSTELLATION_6 && total > mirrorsMax)
      addConstellation6Buffs(kitEffectState, characterId, total - mirrorsMax, constellationBuffs);
  };

  // A Projection Attack triggers on a normal attack, charged attack or plunge that strikes an enemy. An Ascension 1 charged
  // Attack or plunge makes a Mirror first, so the projection counts it, and Projection Attack's own cooldown holds it to once
  // Each 1.6 seconds, as gcsim's projection does
  const triggerProjection = (
    { kitEffectState }: KitContext,
    { body, combatant }: KitStrike,
    isMirrorSource: boolean,
  ): void => {
    const { ascension, characterId } = combatant;
    if (
      isMirrorSource &&
      ascension >= ASCENSION_1 &&
      startKitCooldown(kitEffectState, characterId, ASCENSION_1_ICD_STATUS_ID, ascension1IcdSeconds)
    )
      gainMirrors(kitEffectState, body, combatant, 1);
    const count = getMirrorCount(kitEffectState.effects, characterId);
    if (
      count === 0 ||
      !startKitCooldown(kitEffectState, characterId, PROJECTION_ICD_STATUS_ID, projectionCooldownSeconds)
    )
      return;
    castKitSummon(kitEffectState, body, combatant, takeOne(projectionAttacks, count - 1));
  };
  const strikeHitBehaviour: KitHitBehaviour = {
    onStrike: (context, strike) => triggerProjection(context, strike, false),
  };
  const mirrorSourceHitBehaviour: KitHitBehaviour = {
    onStrike: (context, strike) => triggerProjection(context, strike, true),
  };

  // The tap's and the hold's hit, with their share of his Elemental Mastery, and the Mirrors each makes its own seconds
  // After the cast
  const createSkillBehaviour = (mirrorSeconds: number): KitActionBehaviour => ({
    hits: [{ additiveBaseDamageBonus: (striker) => elementalMasteryMultiplier(striker, skillElementalMasteryShare) }],
    onStart: ({ activeCombatant: combatant, body, kitEffectState }) =>
      scheduleKitTask(kitEffectState, combatant.characterId, mirrorSeconds, (tick) =>
        gainMirrors(
          tick.kitEffectState,
          body,
          combatant,
          getSkillMirrorGain(tick.kitEffectState.effects, combatant.characterId),
        ),
      ),
  });

  return {
    burst: {
      onStart: ({ activeCombatant: combatant, body, kitEffectState, party }) => {
        const { characterId, constellationCount } = combatant;
        const consumed = getMirrorCount(kitEffectState.effects, characterId);
        castKitSummon(
          kitEffectState,
          body,
          combatant,
          particularFieldHits.slice(0, burstBaseHitCount + burstHitCountPerMirror * consumed),
        );
        setMirrorCount(kitEffectState, characterId, 0);
        // Constellation 4's loss is the team's Elemental Mastery for each Mirror consumed, to every member but Alhaitham
        if (constellationCount >= CONSTELLATION_4 && consumed > 0)
          for (const memberId of getDeployedCharacterIds(party)) {
            if (memberId === characterId) continue;
            buffKitMember(kitEffectState, memberId, {
              amount: constellation4ElementalMasteryPerMirror * consumed,
              attribute: Attribute.ElementalMastery,
              secondsRemaining: constellation4Seconds,
              source: CONSTELLATION_4_LOSS_SOURCE,
            });
          }
        // Constellation 6 makes three Mirrors whatever the burst consumed, and the rest are made the regeneration's
        // Seconds on
        const generated = constellationCount >= CONSTELLATION_6 ? mirrorsMax : mirrorsMax - consumed;
        if (generated <= 0) return;
        scheduleKitTask(
          kitEffectState,
          characterId,
          burstMirrorRegenSeconds,
          (tick) => {
            gainMirrors(tick.kitEffectState, body, combatant, generated);
            if (constellationCount >= CONSTELLATION_4)
              buffKitMember(tick.kitEffectState, characterId, {
                amount: constellation4DendroDamageBonusPerMirror * generated,
                attribute: Attribute.DendroDamageBonus,
                secondsRemaining: constellation4Seconds,
                source: CONSTELLATION_4_GAIN_SOURCE,
              });
          },
          { id: MIRROR_REGEN_TASK_ID },
        );
      },
    },
    chargedAttack: { hits: kit.chargedAttack.hits.map(() => mirrorSourceHitBehaviour) },
    getStrikeDamageBonus: ({ combatant, hit }) =>
      combatant.ascension >= ASCENSION_4 &&
      (hit.internalCooldownTag === InternalCooldownTag.ElementalBurst ||
        hit.internalCooldownTag === InternalCooldownTag.ElementalSkill)
        ? Math.min(
            combatant.attributes.attributeTotalMap[Attribute.ElementalMastery] * ascension4DamagePerElementalMastery,
            ascension4DamageMax,
          )
        : 0,
    normalAttacks: kit.normalAttacks.map(({ hits }) => ({ hits: hits.map(() => strikeHitBehaviour) })),
    // Leaving the field clears the Mirrors and the Mirror a rush or a burst has yet to make, as gcsim's swap does
    onKitEvent: (event, { kitEffectState }, combatant) => {
      if (event.kind !== KitEventKind.CharacterSwapped || event.previousCharacterId !== combatant.characterId) return;
      setMirrorCount(kitEffectState, combatant.characterId, 0);
      for (const effect of kitEffectState.effects)
        if (effect.kind === "field" && effect.id === MIRROR_REGEN_TASK_ID) effect.secondsRemaining = 0;
    },
    plungeCollision: mirrorSourceHitBehaviour,
    plunges: {
      [KitPlunge.High]: { hits: [mirrorSourceHitBehaviour] },
      [KitPlunge.Low]: { hits: [mirrorSourceHitBehaviour] },
    },
    skill: createSkillBehaviour(takeOne(mirrorSecondsList, 0)),
    skillHolds: [createSkillBehaviour(takeOne(mirrorSecondsList, 1))],
  };
};
