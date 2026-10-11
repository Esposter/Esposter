import type { TalentMultiplierMap } from "#src/models/character/TalentMultiplierMap";
import type { Combatant } from "#src/models/kit/Combatant";
import type { Kit } from "#src/models/kit/Kit";
import type { KitAction } from "#src/models/kit/KitAction";
import type { KitContext } from "#src/models/kit/KitContext";
import type { KitEffect } from "#src/models/kit/KitEffect";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitField } from "#src/models/kit/KitField";
import type { KitHealthChangedEvent } from "#src/models/kit/KitHealthChangedEvent";
import type { KitHit } from "#src/models/kit/KitHit";
import type { KitStatus } from "#src/models/kit/KitStatus";
import type { KitStrike } from "#src/models/kit/KitStrike";
import type { Party } from "#src/models/party/Party";
import type { GroundPoint } from "genshin-engine";

import { Attribute } from "#src/models/character/Attribute";
import { AttackTag } from "#src/models/combat/AttackTag";
import { InternalCooldownTag } from "#src/models/combat/InternalCooldownTag";
import { Element } from "#src/models/Element";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { TALENT_START_LEVEL } from "#src/services/character/constants";
import { DAMAGE_BONUS_ATTRIBUTES } from "#src/services/combat/damage/constants";
import { SKILL_TARGETING_AREA, STRIKE_TARGETING_AREA } from "#src/services/kit/constants";
import { createBoxReach } from "#src/services/kit/createBoxReach";
import { createCircleReach } from "#src/services/kit/createCircleReach";
import { createMaxHealthScaledBonus } from "#src/services/kit/createMaxHealthScaledBonus";
import { createTargetedHitArea } from "#src/services/kit/createTargetedHitArea";
import { addKitEffect } from "#src/services/kit/effects/addKitEffect";
import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { buffKitMember } from "#src/services/kit/effects/buffKitMember";
import { castKitSummon } from "#src/services/kit/effects/castKitSummon";
import { changeKitMemberHealth } from "#src/services/kit/effects/changeKitMemberHealth";
import { checkHasKitStatus } from "#src/services/kit/effects/checkHasKitStatus";
import { checkIsKitStatusActive } from "#src/services/kit/effects/checkIsKitStatusActive";
import { createKitField } from "#src/services/kit/effects/createKitField";
import { findKitStatus } from "#src/services/kit/effects/findKitStatus";
import { scheduleKitTask } from "#src/services/kit/effects/scheduleKitTask";
import { startKitCooldown } from "#src/services/kit/effects/startKitCooldown";
import { getTalentMultiplier } from "#src/services/kit/getTalentMultiplier";
import { selectAttackTarget } from "#src/services/kit/selectAttackTarget";
import { gainPartyMemberEnergy } from "#src/services/party/gainPartyMemberEnergy";
import { getDeployedCharacterIds } from "#src/services/party/getDeployedCharacterIds";
import { getPartyMember } from "#src/services/party/getPartyMember";

// Furina's proud skill groups, read at her talent level. The attack group holds the four strikes at 0 to 3, the charged
// Attack at 4 and its flat stamina at 5, the plunges' collision, low and high at 6, 7 and 8, and Spiritbreath Thorn's and
// Surging Blade's multiplier at 9 with their cooldowns in seconds at 10 and 11. The skill group holds the Ousia bubble at
// 0, Gentilhomme Usher's, Surintendante Chevalmarin's and Mademoiselle Crabaletta's hits at 2, 3 and 4, the share of each
// Member's Max HP they drain at 5, 6 and 7, the Singer of Many Waters' heal as a share of Max HP at 8 and its flat HP at 9,
// And the skill's cooldown at 10. The burst group holds its hit at 0, the share of HP each Fanfare point stands for at 2
// And the most Fanfare at 3, each point's DMG Bonus at 4 and Incoming Healing Bonus at 5, the burst's cooldown at 6 and
// Its energy cost at 7
const FURINA_ATTACK_GROUP_ID = 8931;
const FURINA_SKILL_GROUP_ID = 8932;
const FURINA_BURST_GROUP_ID = 8939;

export const FURINA_CHARACTER_ID = 10_000_089;

// Measured: gcsim (MIT) furina/attack.go, each strike's hitmark, the frame its action cancels at by default, and its reach
// Round the primary target: a box of 1.5 by 2.8 metres from 0.1 behind it for the first, circles of radius 1.7 and 1.9
// Centred 0.1 and 0.5 metres ahead of it for the second and third, and a box of 5 by 6 metres from 2.5 behind it for the
// Fourth. Gcsim gives the strikes no poise
// https://github.com/genshinsim/gcsim/tree/main/internal/characters/furina
const NORMAL_ATTACKS = [
  {
    cancelFrames: 34,
    hitArea: createTargetedHitArea(STRIKE_TARGETING_AREA, createBoxReach(-0.1, 1.5, 2.8).radius),
    hitmarkFrames: 15,
  },
  { cancelFrames: 28, hitArea: createTargetedHitArea(STRIKE_TARGETING_AREA, 0.1 + 1.7), hitmarkFrames: 12 },
  { cancelFrames: 48, hitArea: createTargetedHitArea(STRIKE_TARGETING_AREA, 0.5 + 1.9), hitmarkFrames: 21 },
  {
    cancelFrames: 58,
    hitArea: createTargetedHitArea(STRIKE_TARGETING_AREA, createBoxReach(-2.5, 5, 6).radius),
    hitmarkFrames: 27,
  },
];
// Measured: gcsim (MIT) furina/attack.go, Spiritbreath Thorn in Ousia and Surging Blade in Pneuma: a strike that lands opens
// The Arkhe's own hit unless its cooldown runs, and it strikes 30 frames on from where the body stood, a box 1.2 metres
// Wide and 4.5 long from 0.3 behind it. It is a normal attack's Hydro hit, with no gauge
// https://github.com/genshinsim/gcsim/tree/main/internal/characters/furina
const ARKHE_DELAY_FRAMES = 30;
const ARKHE_HIT_AREA = createBoxReach(-0.3, 1.2, 4.5);
const PNEUMA_STATUS_ID = "furina-pneuma";
const SPIRITBREATH_THORN_COOLDOWN_STATUS_ID = "furina-spiritbreath-thorn-cooldown";
const SURGING_BLADE_COOLDOWN_STATUS_ID = "furina-surging-blade-cooldown";

// Measured: gcsim (MIT) furina/charge.go, the charged attack's circle of radius 2.6 round the body at 33 frames of its
// 253-frame animation. Her Arkhe turns a frame after the hit, and while Salon Solitaire lasts the other Arkhe's summons
// Take over from the ones out
// https://github.com/genshinsim/gcsim/tree/main/internal/characters/furina
const CHARGED_ATTACK_FRAMES = 253;
const CHARGED_ATTACK_HITMARK_FRAMES = 33;
const CHARGED_ATTACK_HIT_AREA = createCircleReach(0, 2.6);
const ARKHE_SWITCH_FRAMES = CHARGED_ATTACK_HITMARK_FRAMES + 1;

// Measured: gcsim (MIT) furina/plunge.go, the collision a circle of radius 1 and the low and high plunges circles of radius
// 3 and 5, each centred a metre ahead of the body, with the collision at 40 frames, the low plunge's hitmark at 46 and its
// Animation at 75, and the high plunge's at 47 and 76, their poise 100 and 150
// https://github.com/genshinsim/gcsim/tree/main/internal/characters/furina
const PLUNGE_COLLISION_HIT_AREA = createCircleReach(1, 1);
const PLUNGE_COLLISION_HITMARK_FRAMES = 40;
const LOW_PLUNGE_HIT_AREA = createCircleReach(1, 3);
const LOW_PLUNGE_HITMARK_FRAMES = 46;
const LOW_PLUNGE_FRAMES = 75;
const LOW_PLUNGE_POISE_DAMAGE = 100;
const HIGH_PLUNGE_HIT_AREA = createCircleReach(1, 5);
const HIGH_PLUNGE_HITMARK_FRAMES = 47;
const HIGH_PLUNGE_FRAMES = 76;
const HIGH_PLUNGE_POISE_DAMAGE = 150;

// Measured: gcsim (MIT) furina/skill.go, Salon Solitaire's 54-frame animation in Ousia. In Ousia its bubble strikes a circle
// Of radius 5 round the body at 18 frames and the Salon members come out with it; in Pneuma the Singer of Many Waters
// Comes out 10 frames in. The skill lasts 1736 frames from then, against the table's 30 seconds
// https://github.com/genshinsim/gcsim/tree/main/internal/characters/furina
const SKILL_FRAMES = 54;
const OUSIA_BUBBLE_HITMARK_FRAMES = 18;
const OUSIA_BUBBLE_HIT_AREA = createCircleReach(0, 5);
const PNEUMA_SUMMON_DELAY_FRAMES = 10;
const SALON_FRAMES = 1736;
const SALON_STATUS_ID = "furina-salon-solitaire";
const SALON_MEMBER_FIELD_ID = "furina-salon-member";
const SALON_ATTACK_SUMMON_ID = "furina-salon-attack";
const SINGER_FIELD_ID = "furina-singer";
// Measured: gcsim (MIT) furina/skill.go, each Salon member's mean schedule from its summon in frames, the frames its attack
// Travels to the primary target, and the circle round that target it strikes. As it attacks it drains every member above
// Half HP by its share of that member's Max HP, each one drained adding a tenth to the attack's damage. Chevalmarin's and
// Usher's hits count under their own internal cooldown tags, and Crabaletta's under none
// https://github.com/genshinsim/gcsim/tree/main/internal/characters/furina
const SALON_MEMBERS = [
  {
    drainIndex: 6,
    initialTickFrames: 72.3333,
    internalCooldownTag: InternalCooldownTag.FurinaChevalmarin,
    intervalFrames: 97.5858,
    radius: 0.5,
    talentIndex: 3,
    travelFrames: 20,
  },
  {
    drainIndex: 5,
    initialTickFrames: 74.5,
    internalCooldownTag: InternalCooldownTag.FurinaUsher,
    intervalFrames: 202.138,
    radius: 2.5,
    talentIndex: 2,
    travelFrames: 40,
  },
  { drainIndex: 7, initialTickFrames: 71.5926, intervalFrames: 313.859, radius: 3.5, talentIndex: 4, travelFrames: 41 },
];
const SALON_DRAINED_HEALTH_SHARE_MIN = 0.5;
const SALON_DAMAGE_BONUS_PER_DRAINED_MEMBER = 0.1;
// The Singer heals the character on the field 63 frames after it comes out and every 120 frames on
const SINGER_INITIAL_TICK_FRAMES = 63;
const SINGER_INTERVAL_FRAMES = 120;

// Measured: gcsim (MIT) furina/burst.go, Let the People Rejoice's 121-frame animation and its circle of radius 5 round the
// Body at 98 frames. Its Fanfare starts 95 frames in and lasts 18.2 seconds, against the table's 18. Each change to a
// Member's HP while it lasts gives Fanfare by the share of HP changed: the first 6 frames on, opening a 35-frame window a
// Frame on, and those within the window as it closes, as gcsim estimates the game's debounce
// https://github.com/genshinsim/gcsim/tree/main/internal/characters/furina
const BURST_FRAMES = 121;
const BURST_HITMARK_FRAMES = 98;
const BURST_HIT_AREA = createCircleReach(0, 5);
const FANFARE_START_FRAMES = 95;
const FANFARE_SECONDS = 18.2;
const FANFARE_GAIN_DELAY_FRAMES = 6;
const FANFARE_DEBOUNCE_START_FRAMES = 1;
const FANFARE_DEBOUNCE_FRAMES = 30 + FANFARE_GAIN_DELAY_FRAMES - 1;
const FANFARE_STATUS_ID = "furina-fanfare";
const FANFARE_DEBOUNCE_STATUS_ID = "furina-fanfare-debounce";
const FANFARE_BUFF_SOURCE = "furina-fanfare";

// Measured: gcsim (MIT) furina/asc.go. Ascension 1's Endless Waltz: a heal past full HP by another character's kit, on the
// Character on the field, starts a regeneration of 2% of each member's Max HP every two seconds, which runs on while the
// Last such heal is under four seconds old. Ascension 4 raises the Salon members' DMG by 0.7% for each 1,000 of her Max HP,
// Up to 28%, and cuts the Singer's interval by 0.4% for each 1,000, up to 16%
// https://github.com/genshinsim/gcsim/tree/main/internal/characters/furina
const ASCENSION_1 = 1;
const ASCENSION_4 = 4;
const ENDLESS_WALTZ_STATUS_ID = "furina-endless-waltz";
const ENDLESS_WALTZ_FIELD_ID = "furina-endless-waltz-regeneration";
const ENDLESS_WALTZ_SECONDS = 4;
const ENDLESS_WALTZ_INTERVAL_SECONDS = 2;
const ENDLESS_WALTZ_HEALTH_SHARE = 0.02;
const ASCENSION_4_MAX_HEALTH_STEP = 1000;
const ASCENSION_4_DAMAGE_BONUS_PER_STEP = 0.007;
const ASCENSION_4_DAMAGE_BONUS_MAX = 0.28;
const ASCENSION_4_INTERVAL_CUT_PER_STEP = 0.004;
const ASCENSION_4_INTERVAL_CUT_MAX = 0.16;

// Measured: gcsim (MIT) furina/cons.go. Constellation 1 starts the Fanfare at 150 and raises its most by 100, Constellation
// 2 gives 250% more Fanfare from each change, and Constellation 4 gives her 4 energy as a Salon member's hit lands or the
// Singer heals, once each five seconds
// https://github.com/genshinsim/gcsim/tree/main/internal/characters/furina
const CONSTELLATION_1 = 1;
const CONSTELLATION_2 = 2;
const CONSTELLATION_4 = 4;
const CONSTELLATION_1_FANFARE_START = 150;
const CONSTELLATION_1_FANFARE_MAX_BONUS = 100;
const CONSTELLATION_2_FANFARE_MULTIPLIER = 3.5;
const CONSTELLATION_4_ENERGY = 4;
const CONSTELLATION_4_COOLDOWN_SECONDS = 5;
const CONSTELLATION_4_COOLDOWN_STATUS_ID = "furina-c4-cooldown";

type SalonMember = (typeof SALON_MEMBERS)[number];

// Ascension 4's Salon DMG Bonus and the share it cuts off the Singer's interval, from her Max HP
const getSalonDamageBonus = ({ ascension, attributes }: Combatant): number =>
  ascension < ASCENSION_4
    ? 0
    : Math.min(
        (attributes.maxHealth / ASCENSION_4_MAX_HEALTH_STEP) * ASCENSION_4_DAMAGE_BONUS_PER_STEP,
        ASCENSION_4_DAMAGE_BONUS_MAX,
      );
const getSingerIntervalCut = ({ ascension, attributes }: Combatant): number =>
  ascension < ASCENSION_4
    ? 0
    : Math.min(
        (attributes.maxHealth / ASCENSION_4_MAX_HEALTH_STEP) * ASCENSION_4_INTERVAL_CUT_PER_STEP,
        ASCENSION_4_INTERVAL_CUT_MAX,
      );

// Ends the Salon a character holds, its members' fields or the Singer's and the attacks still on their way, as gcsim
// Drops a summon's tasks once a later summon has taken over from it
const endSalon = (kitEffectState: KitEffectState, characterId: number): void => {
  const checkIsSalonEffect = (effect: KitEffect): boolean =>
    (effect.kind === "field" &&
      effect.characterId === characterId &&
      (effect.id === SALON_MEMBER_FIELD_ID || effect.id === SINGER_FIELD_ID)) ||
    (effect.kind === "summon" && effect.combatant.characterId === characterId && effect.id === SALON_ATTACK_SUMMON_ID);
  for (const effect of kitEffectState.effects) if (checkIsSalonEffect(effect)) effect.secondsRemaining = 0;
  kitEffectState.effects = kitEffectState.effects.filter((effect) => !checkIsSalonEffect(effect));
};

// Constellation 4's energy, once each five seconds
const gainConstellation4Energy = ({ kitEffectState, party }: KitContext, combatant: Combatant): void => {
  const { characterId, constellationCount } = combatant;
  if (
    constellationCount < CONSTELLATION_4 ||
    !startKitCooldown(kitEffectState, characterId, CONSTELLATION_4_COOLDOWN_STATUS_ID, CONSTELLATION_4_COOLDOWN_SECONDS)
  )
    return;
  gainPartyMemberEnergy(party, combatant, CONSTELLATION_4_ENERGY);
};

// Endless Waltz's regeneration, healing each member of the deployed team every two seconds until the status it runs on
// Has run out
const createEndlessWaltzField = (combatant: Combatant, { x, z }: GroundPoint): KitField => {
  const { characterId } = combatant;
  const field = createKitField(
    characterId,
    { x, z },
    {
      id: ENDLESS_WALTZ_FIELD_ID,
      nextTickSeconds: ENDLESS_WALTZ_INTERVAL_SECONDS,
      onTick: (tick) => {
        if (field.secondsRemaining <= 0) return;
        if (!checkIsKitStatusActive(tick.kitEffectState.effects, characterId, ENDLESS_WALTZ_STATUS_ID)) {
          field.secondsRemaining = 0;
          return;
        }
        for (const memberId of getDeployedCharacterIds(tick.party)) {
          const member = tick.characterIdCombatantMap.get(memberId);
          if (member)
            changeKitMemberHealth(tick, combatant, memberId, ENDLESS_WALTZ_HEALTH_SHARE * member.attributes.maxHealth);
        }
      },
      secondsRemaining: Number.POSITIVE_INFINITY,
      tickIntervalSeconds: ENDLESS_WALTZ_INTERVAL_SECONDS,
    },
  );
  return field;
};

// Ascension 1: another character's heal past full HP on the character on the field starts Endless Waltz unless it runs,
// A new one ending the regeneration of the one that ran out, and restarts its four seconds either way
const startEndlessWaltz = (
  { activeCombatant, body, kitEffectState }: KitContext,
  combatant: Combatant,
  event: KitHealthChangedEvent,
): void => {
  const { ascension, characterId } = combatant;
  if (
    ascension < ASCENSION_1 ||
    event.overflowHealthShare <= 0 ||
    event.sourceCharacterId === characterId ||
    event.characterId !== activeCombatant.characterId
  )
    return;
  if (!checkIsKitStatusActive(kitEffectState.effects, characterId, ENDLESS_WALTZ_STATUS_ID)) {
    for (const effect of kitEffectState.effects)
      if (effect.kind === "field" && effect.characterId === characterId && effect.id === ENDLESS_WALTZ_FIELD_ID)
        effect.secondsRemaining = 0;
    addKitEffect(kitEffectState, createEndlessWaltzField(combatant, body.position));
  }
  addKitStatus(kitEffectState, characterId, { id: ENDLESS_WALTZ_STATUS_ID, secondsRemaining: ENDLESS_WALTZ_SECONDS });
};

// Furina's first kit, at talent level 1: her four strikes, which open Spiritbreath Thorn or Surging Blade, a charged attack
// That turns her Arkhe, a collision and two plunges, Salon Solitaire with its Ousia bubble and members, which drain the
// Team, or its Singer of Many Waters, which heals the character on the field, and Let the People Rejoice with its Fanfare.
// Ascensions 1 and 4 and Constellations 1, 2's Fanfare and 4 are built; Constellation 2's Max HP, 3, 5 and 6 are not
export const createFurinaKit = (talentMultiplierMap: TalentMultiplierMap): Kit => {
  const attackMultiplier = (index: number): number =>
    getTalentMultiplier(talentMultiplierMap, FURINA_ATTACK_GROUP_ID, TALENT_START_LEVEL, index);
  const skillMultiplier = (index: number): number =>
    getTalentMultiplier(talentMultiplierMap, FURINA_SKILL_GROUP_ID, TALENT_START_LEVEL, index);
  const burstMultiplier = (index: number): number =>
    getTalentMultiplier(talentMultiplierMap, FURINA_BURST_GROUP_ID, TALENT_START_LEVEL, index);

  const arkheHit: KitHit = {
    element: Element.Hydro,
    hitArea: ARKHE_HIT_AREA,
    hitmarkSeconds: ARKHE_DELAY_FRAMES / 60,
    poiseDamage: 0,
    talentMultiplier: attackMultiplier(9),
  };
  // A strike that lands opens the Arkhe's hit from where the body stands, unless that Arkhe's cooldown runs
  const openArkheHit = ({ kitEffectState }: KitContext, { body, combatant }: KitStrike): void => {
    const { characterId } = combatant;
    const isPneuma = checkHasKitStatus(kitEffectState.effects, characterId, PNEUMA_STATUS_ID);
    const cooldownStatusId = isPneuma ? SURGING_BLADE_COOLDOWN_STATUS_ID : SPIRITBREATH_THORN_COOLDOWN_STATUS_ID;
    if (!startKitCooldown(kitEffectState, characterId, cooldownStatusId, attackMultiplier(isPneuma ? 11 : 10))) return;
    castKitSummon(kitEffectState, body, combatant, [arkheHit], { attackTag: AttackTag.NormalAttack });
  };

  // A Salon member's attack on the enemy nearest its centre: it drains every member above half HP, then strikes the circle
  // Round that enemy once its attack has travelled, a tenth harder for each member it drained. With no enemy in reach it
  // Neither drains nor strikes
  const attackWithSalonMember = (
    tick: KitContext,
    combatant: Combatant,
    { drainIndex, internalCooldownTag, radius, talentIndex, travelFrames }: SalonMember,
    centre: GroundPoint,
  ): void => {
    const target = selectAttackTarget(
      SKILL_TARGETING_AREA,
      { facing: 0, height: 0, position: centre },
      tick.enemyMap.values(),
    );
    if (!target) return;
    let drainedCount = 0;
    for (const memberId of getDeployedCharacterIds(tick.party)) {
      const member = tick.characterIdCombatantMap.get(memberId);
      if (!member || getPartyMember(tick.party, memberId).healthShare <= SALON_DRAINED_HEALTH_SHARE_MIN) continue;
      drainedCount++;
      changeKitMemberHealth(tick, combatant, memberId, -skillMultiplier(drainIndex) * member.attributes.maxHealth);
    }
    const hit: KitHit = {
      additiveBaseDamageBonus: createMaxHealthScaledBonus(
        skillMultiplier(talentIndex) * (1 + SALON_DAMAGE_BONUS_PER_DRAINED_MEMBER * drainedCount),
      ),
      damageBonus: getSalonDamageBonus(combatant),
      element: Element.Hydro,
      gauge: 1,
      hitArea: createCircleReach(0, radius),
      hitmarkSeconds: travelFrames / 60,
      internalCooldownTag,
      onStrike: (context, strike) => gainConstellation4Energy(context, strike.combatant),
      poiseDamage: 0,
      talentMultiplier: 0,
    };
    castKitSummon(tick.kitEffectState, { facing: 0, height: 0, position: target.position }, combatant, [hit], {
      attackTag: AttackTag.ElementalSkill,
      id: SALON_ATTACK_SUMMON_ID,
    });
  };

  const createSalonMemberField = (
    combatant: Combatant,
    salonMember: SalonMember,
    { x, z }: GroundPoint,
    delayFrames: number,
    secondsRemaining: number,
  ): KitField => {
    const field = createKitField(
      combatant.characterId,
      { x, z },
      {
        id: SALON_MEMBER_FIELD_ID,
        isFollowing: true,
        nextTickSeconds: (delayFrames + salonMember.initialTickFrames) / 60,
        onTick: (tick) => {
          if (field.secondsRemaining > 0) attackWithSalonMember(tick, combatant, salonMember, field.centre);
        },
        secondsRemaining,
        tickIntervalSeconds: salonMember.intervalFrames / 60,
      },
    );
    return field;
  };

  const createSingerField = (
    combatant: Combatant,
    { x, z }: GroundPoint,
    delayFrames: number,
    secondsRemaining: number,
  ): KitField => {
    const field = createKitField(
      combatant.characterId,
      { x, z },
      {
        id: SINGER_FIELD_ID,
        isFollowing: true,
        nextTickSeconds: (delayFrames + SINGER_INITIAL_TICK_FRAMES) / 60,
        onTick: (tick) => {
          if (field.secondsRemaining <= 0) return;
          changeKitMemberHealth(
            tick,
            combatant,
            tick.activeCombatant.characterId,
            skillMultiplier(9) + skillMultiplier(8) * combatant.attributes.maxHealth,
          );
          gainConstellation4Energy(tick, combatant);
        },
        secondsRemaining,
        tickIntervalSeconds: Math.round(SINGER_INTERVAL_FRAMES * (1 - getSingerIntervalCut(combatant))) / 60,
      },
    );
    return field;
  };

  // Brings out the summons of the Arkhe she holds after the delay, for the seconds Salon Solitaire has left, in place of
  // The ones out
  const summonSalon = (
    kitEffectState: KitEffectState,
    combatant: Combatant,
    centre: GroundPoint,
    delayFrames: number,
    secondsRemaining: number,
  ): void => {
    endSalon(kitEffectState, combatant.characterId);
    if (checkHasKitStatus(kitEffectState.effects, combatant.characterId, PNEUMA_STATUS_ID))
      addKitEffect(kitEffectState, createSingerField(combatant, centre, delayFrames, secondsRemaining));
    else
      for (const salonMember of SALON_MEMBERS)
        addKitEffect(
          kitEffectState,
          createSalonMemberField(combatant, salonMember, centre, delayFrames, secondsRemaining),
        );
  };

  // The charged attack's turn of her Arkhe, Ousia to Pneuma or back, which hands Salon Solitaire to the other Arkhe's
  // Summons while it lasts
  const switchArkhe = (kitEffectState: KitEffectState, combatant: Combatant, centre: GroundPoint): void => {
    const { characterId } = combatant;
    const pneuma = findKitStatus(kitEffectState.effects, characterId, PNEUMA_STATUS_ID);
    if (pneuma) kitEffectState.effects = kitEffectState.effects.filter((effect) => effect !== pneuma);
    else
      addKitStatus(kitEffectState, characterId, { id: PNEUMA_STATUS_ID, secondsRemaining: Number.POSITIVE_INFINITY });
    const salon = findKitStatus(kitEffectState.effects, characterId, SALON_STATUS_ID);
    if (salon && salon.secondsRemaining > 0) summonSalon(kitEffectState, combatant, centre, 0, salon.secondsRemaining);
  };

  const getFanfareMax = ({ constellationCount }: Combatant): number =>
    burstMultiplier(3) + (constellationCount >= CONSTELLATION_1 ? CONSTELLATION_1_FANFARE_MAX_BONUS : 0);
  // What each Fanfare point gives every member: a DMG Bonus to all of its DMG and an Incoming Healing Bonus
  const fanfareBonusesPerPoint: [Attribute, number][] = [
    ...DAMAGE_BONUS_ATTRIBUTES.map((attribute): [Attribute, number] => [attribute, burstMultiplier(4)]),
    [Attribute.IncomingHealingBonus, burstMultiplier(5)],
  ];
  // Sets the Fanfare the burst holds, up to its most, and the bonuses it gives each member of the deployed team for the
  // Seconds the burst has left
  const setFanfare = (
    kitEffectState: KitEffectState,
    party: Party,
    combatant: Combatant,
    fanfareStatus: KitStatus,
    fanfare: number,
  ): void => {
    fanfareStatus.stacks = Math.min(getFanfareMax(combatant), fanfare);
    const { secondsRemaining, stacks } = fanfareStatus;
    for (const characterId of getDeployedCharacterIds(party))
      for (const [attribute, amountPerPoint] of fanfareBonusesPerPoint)
        buffKitMember(kitEffectState, characterId, {
          amount: stacks * amountPerPoint,
          attribute,
          secondsRemaining,
          source: FANFARE_BUFF_SOURCE,
        });
  };
  // A change to a member's HP while the Fanfare lasts gives Fanfare by the share changed, after the debounce's delay
  const gainFanfare = ({ kitEffectState }: KitContext, combatant: Combatant, healthShare: number): void => {
    const { characterId, constellationCount } = combatant;
    if (healthShare === 0 || !checkIsKitStatusActive(kitEffectState.effects, characterId, FANFARE_STATUS_ID)) return;
    const fanfare =
      (Math.abs(healthShare) / burstMultiplier(2)) *
      (constellationCount >= CONSTELLATION_2 ? CONSTELLATION_2_FANFARE_MULTIPLIER : 1);
    const debounce = findKitStatus(kitEffectState.effects, characterId, FANFARE_DEBOUNCE_STATUS_ID);
    let delaySeconds = FANFARE_GAIN_DELAY_FRAMES / 60;
    if (debounce && debounce.secondsRemaining > 0) delaySeconds = debounce.secondsRemaining;
    else
      scheduleKitTask(kitEffectState, characterId, FANFARE_DEBOUNCE_START_FRAMES / 60, (tick) =>
        addKitStatus(tick.kitEffectState, characterId, {
          id: FANFARE_DEBOUNCE_STATUS_ID,
          secondsRemaining: FANFARE_DEBOUNCE_FRAMES / 60,
        }),
      );
    scheduleKitTask(kitEffectState, characterId, delaySeconds, (tick) => {
      const fanfareStatus = findKitStatus(tick.kitEffectState.effects, characterId, FANFARE_STATUS_ID);
      if (fanfareStatus && fanfareStatus.secondsRemaining > 0)
        setFanfare(tick.kitEffectState, tick.party, combatant, fanfareStatus, (fanfareStatus.stacks ?? 0) + fanfare);
    });
  };

  const normalAttacks = NORMAL_ATTACKS.map(({ cancelFrames, hitArea, hitmarkFrames }, index): KitAction => ({
    hits: [
      {
        hitArea,
        hitmarkSeconds: hitmarkFrames / 60,
        internalCooldownTag: InternalCooldownTag.NormalAttack,
        onStrike: openArkheHit,
        poiseDamage: 0,
        talentMultiplier: attackMultiplier(index),
      },
    ],
    seconds: cancelFrames / 60,
    targetingArea: STRIKE_TARGETING_AREA,
  }));

  const chargedAttack: KitAction = {
    hits: [
      {
        hitArea: CHARGED_ATTACK_HIT_AREA,
        hitmarkSeconds: CHARGED_ATTACK_HITMARK_FRAMES / 60,
        internalCooldownTag: InternalCooldownTag.ChargedAttack,
        poiseDamage: 0,
        talentMultiplier: attackMultiplier(4),
      },
    ],
    onStart: ({ activeCombatant: combatant, body, kitEffectState }) =>
      scheduleKitTask(kitEffectState, combatant.characterId, ARKHE_SWITCH_FRAMES / 60, (tick) =>
        switchArkhe(tick.kitEffectState, combatant, body.position),
      ),
    seconds: CHARGED_ATTACK_FRAMES / 60,
    targetingArea: STRIKE_TARGETING_AREA,
  };

  const createPlunge = (
    hitArea: KitHit["hitArea"],
    hitmarkFrames: number,
    animationFrames: number,
    poiseDamage: number,
    index: number,
  ): KitAction => ({
    hits: [
      {
        hitArea,
        hitmarkSeconds: hitmarkFrames / 60,
        isBlunt: true,
        poiseDamage,
        talentMultiplier: attackMultiplier(index),
      },
    ],
    seconds: animationFrames / 60,
    targetingArea: STRIKE_TARGETING_AREA,
  });

  const ousiaBubbleHit: KitHit = {
    additiveBaseDamageBonus: createMaxHealthScaledBonus(skillMultiplier(0)),
    element: Element.Hydro,
    gauge: 1,
    hitArea: OUSIA_BUBBLE_HIT_AREA,
    hitmarkSeconds: OUSIA_BUBBLE_HITMARK_FRAMES / 60,
    poiseDamage: 0,
    talentMultiplier: 0,
  };
  // Salon Solitaire takes the Arkhe she holds as it starts: Ousia's bubble and members, or Pneuma's Singer. Its hits are
  // Its summons', so the action holds none of its own
  const elementalSkill: KitAction = {
    hits: [],
    onStart: ({ activeCombatant: combatant, body, kitEffectState }) => {
      const { characterId } = combatant;
      const isPneuma = checkHasKitStatus(kitEffectState.effects, characterId, PNEUMA_STATUS_ID);
      const delayFrames = isPneuma ? PNEUMA_SUMMON_DELAY_FRAMES : OUSIA_BUBBLE_HITMARK_FRAMES;
      const secondsRemaining = (SALON_FRAMES + delayFrames) / 60;
      addKitStatus(kitEffectState, characterId, { id: SALON_STATUS_ID, secondsRemaining });
      if (!isPneuma)
        castKitSummon(kitEffectState, body, combatant, [ousiaBubbleHit], { attackTag: AttackTag.ElementalSkill });
      summonSalon(kitEffectState, combatant, body.position, delayFrames, secondsRemaining);
    },
    seconds: SKILL_FRAMES / 60,
    targetingArea: SKILL_TARGETING_AREA,
  };

  // The burst ends the Fanfare of the one before it as it is cast, and its own starts before its hit lands, so the hit
  // Takes Constellation 1's
  const elementalBurst: KitAction = {
    hits: [
      {
        additiveBaseDamageBonus: createMaxHealthScaledBonus(burstMultiplier(0)),
        element: Element.Hydro,
        gauge: 1,
        hitArea: BURST_HIT_AREA,
        hitmarkSeconds: BURST_HITMARK_FRAMES / 60,
        poiseDamage: 0,
        talentMultiplier: 0,
      },
    ],
    onStart: ({ activeCombatant: combatant, kitEffectState }) => {
      const { characterId, constellationCount } = combatant;
      for (const effect of kitEffectState.effects)
        if (
          (effect.kind === "status" && effect.characterId === characterId && effect.id === FANFARE_STATUS_ID) ||
          (effect.kind === "buff" && effect.source === FANFARE_BUFF_SOURCE)
        )
          effect.secondsRemaining = 0;
      scheduleKitTask(kitEffectState, characterId, FANFARE_START_FRAMES / 60, (tick) => {
        const fanfareStatus: KitStatus = {
          characterId,
          id: FANFARE_STATUS_ID,
          kind: "status",
          secondsRemaining: FANFARE_SECONDS,
          stacks: 0,
        };
        addKitEffect(tick.kitEffectState, fanfareStatus);
        setFanfare(
          tick.kitEffectState,
          tick.party,
          combatant,
          fanfareStatus,
          constellationCount >= CONSTELLATION_1 ? CONSTELLATION_1_FANFARE_START : 0,
        );
      });
    },
    seconds: BURST_FRAMES / 60,
    targetingArea: SKILL_TARGETING_AREA,
  };

  return {
    burstCooldownSeconds: burstMultiplier(6),
    burstEnergyCost: burstMultiplier(7),
    chargedAttack,
    chargedAttackStamina: attackMultiplier(5),
    elementalBurst,
    elementalSkill,
    highPlunge: createPlunge(
      HIGH_PLUNGE_HIT_AREA,
      HIGH_PLUNGE_HITMARK_FRAMES,
      HIGH_PLUNGE_FRAMES,
      HIGH_PLUNGE_POISE_DAMAGE,
      8,
    ),
    lowPlunge: createPlunge(
      LOW_PLUNGE_HIT_AREA,
      LOW_PLUNGE_HITMARK_FRAMES,
      LOW_PLUNGE_FRAMES,
      LOW_PLUNGE_POISE_DAMAGE,
      7,
    ),
    normalAttacks,
    // Each change to a member's HP feeds the Fanfare and may start Endless Waltz
    onKitEvent: (event, context, combatant) => {
      if (event.kind !== KitEventKind.HealthChanged) return;
      gainFanfare(context, combatant, event.healthShare);
      startEndlessWaltz(context, combatant, event);
    },
    plungeCollision: {
      hitArea: PLUNGE_COLLISION_HIT_AREA,
      hitmarkSeconds: PLUNGE_COLLISION_HITMARK_FRAMES / 60,
      poiseDamage: 0,
      talentMultiplier: attackMultiplier(6),
    },
    skillCooldownSeconds: skillMultiplier(10),
  };
};
