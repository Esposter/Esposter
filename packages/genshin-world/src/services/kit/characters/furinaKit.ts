import type { Combatant } from "#src/models/kit/Combatant";
import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitContext } from "#src/models/kit/KitContext";
import type { KitEffect } from "#src/models/kit/KitEffect";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitField } from "#src/models/kit/KitField";
import type { KitHealthChangedEvent } from "#src/models/kit/KitHealthChangedEvent";
import type { KitHit } from "#src/models/kit/KitHit";
import type { KitRecordReader } from "#src/models/kit/KitRecordReader";
import type { KitStatus } from "#src/models/kit/KitStatus";
import type { KitStrike } from "#src/models/kit/KitStrike";
import type { Party } from "#src/models/party/Party";
import type { GroundPoint } from "genshin-engine";

import { Attribute } from "#src/models/character/Attribute";
import { AttackTag } from "#src/models/combat/AttackTag";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { DAMAGE_BONUS_ATTRIBUTES } from "#src/services/combat/damage/constants";
import { createMaxHealthScaledBonus } from "#src/services/kit/createMaxHealthScaledBonus";
import { addKitEffect } from "#src/services/kit/effects/addKitEffect";
import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { buffKitMember } from "#src/services/kit/effects/buffKitMember";
import { castKitField } from "#src/services/kit/effects/castKitField";
import { castKitSummon } from "#src/services/kit/effects/castKitSummon";
import { changeKitMemberHealth } from "#src/services/kit/effects/changeKitMemberHealth";
import { checkHasKitStatus } from "#src/services/kit/effects/checkHasKitStatus";
import { checkIsKitStatusActive } from "#src/services/kit/effects/checkIsKitStatusActive";
import { findKitStatus } from "#src/services/kit/effects/findKitStatus";
import { removeKitEffects } from "#src/services/kit/effects/removeKitEffects";
import { scheduleKitTask } from "#src/services/kit/effects/scheduleKitTask";
import { startKitCooldown } from "#src/services/kit/effects/startKitCooldown";
import { selectAttackTarget } from "#src/services/kit/selectAttackTarget";
import { toKitSeconds } from "#src/services/kit/toKitSeconds";
import { gainPartyMemberEnergy } from "#src/services/party/gainPartyMemberEnergy";
import { getDeployedCharacterIds } from "#src/services/party/getDeployedCharacterIds";
import { getPartyMember } from "#src/services/party/getPartyMember";
import { takeOne } from "@esposter/shared";

export const FURINA_CHARACTER_ID = 10_000_089;

// Spiritbreath Thorn in Ousia and Surging Blade in Pneuma: a strike that lands opens the Arkhe's own hit unless its
// Cooldown runs, as gcsim (MIT) furina/attack.go gives it
// https://github.com/genshinsim/gcsim/tree/main/internal/characters/furina
const PNEUMA_STATUS_ID = "furina-pneuma";
const SPIRITBREATH_THORN_COOLDOWN_STATUS_ID = "furina-spiritbreath-thorn-cooldown";
const SURGING_BLADE_COOLDOWN_STATUS_ID = "furina-surging-blade-cooldown";

const SALON_STATUS_ID = "furina-salon-solitaire";
const SALON_MEMBER_FIELD_ID = "furina-salon-member";
const SALON_ATTACK_SUMMON_ID = "furina-salon-attack";
const SINGER_FIELD_ID = "furina-singer";
// As gcsim (MIT) furina/skill.go gives it, as a Salon member attacks it drains every member above half HP by its share of
// That member's Max HP, each one drained adding a tenth to the attack's damage
// https://github.com/genshinsim/gcsim/tree/main/internal/characters/furina
const SALON_DRAINED_HEALTH_SHARE_MIN = 0.5;
const SALON_DAMAGE_BONUS_PER_DRAINED_MEMBER = 0.1;

// Measured: gcsim (MIT) furina/burst.go, the Fanfare lasting 18.2 seconds, against the table's 18
// https://github.com/genshinsim/gcsim/tree/main/internal/characters/furina
const FANFARE_SECONDS = 18.2;
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

// Ascension 4's share of her Max HP, a rate per step of it up to a cap: the Salon's DMG Bonus and the Singer's interval cut
const getAscension4MaxHealthShare = ({ ascension, attributes }: Combatant, rate: number, cap: number): number =>
  ascension < ASCENSION_4 ? 0 : Math.min((attributes.maxHealth / ASCENSION_4_MAX_HEALTH_STEP) * rate, cap);
const getSalonDamageBonus = (combatant: Combatant): number =>
  getAscension4MaxHealthShare(combatant, ASCENSION_4_DAMAGE_BONUS_PER_STEP, ASCENSION_4_DAMAGE_BONUS_MAX);
const getSingerIntervalCut = (combatant: Combatant): number =>
  getAscension4MaxHealthShare(combatant, ASCENSION_4_INTERVAL_CUT_PER_STEP, ASCENSION_4_INTERVAL_CUT_MAX);

// Ends the Salon a character holds, its members' fields or the Singer's and the attacks still on their way, as gcsim
// Drops a summon's tasks once a later summon has taken over from it
const endSalon = (kitEffectState: KitEffectState, characterId: number): void => {
  const checkIsSalonEffect = (effect: KitEffect): boolean =>
    (effect.kind === "field" &&
      effect.characterId === characterId &&
      (effect.id === SALON_MEMBER_FIELD_ID || effect.id === SINGER_FIELD_ID)) ||
    (effect.kind === "summon" && effect.combatant.characterId === characterId && effect.id === SALON_ATTACK_SUMMON_ID);
  for (const effect of kitEffectState.effects) if (checkIsSalonEffect(effect)) effect.secondsRemaining = 0;
  removeKitEffects(kitEffectState, checkIsSalonEffect);
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

// Endless Waltz's regeneration, cast to heal each member of the deployed team every two seconds until the status it runs
// On has run out
const castEndlessWaltz = (kitEffectState: KitEffectState, combatant: Combatant, { x, z }: GroundPoint): void => {
  const { characterId } = combatant;
  const field = castKitField(
    kitEffectState,
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
    castEndlessWaltz(kitEffectState, combatant, body.position);
  }
  addKitStatus(kitEffectState, characterId, { id: ENDLESS_WALTZ_STATUS_ID, secondsRemaining: ENDLESS_WALTZ_SECONDS });
};

// A field a member or the Singer casts where she stands, following her body, and ticking on its own schedule
const castFollowingField = (
  kitEffectState: KitEffectState,
  combatant: Combatant,
  { x, z }: GroundPoint,
  {
    delaySeconds,
    id,
    initialTickSeconds,
    intervalSeconds,
    onTick,
    secondsRemaining,
  }: {
    delaySeconds: number;
    id: string;
    initialTickSeconds: number;
    intervalSeconds: number;
    onTick: (tick: KitContext, field: KitField) => void;
    secondsRemaining: number;
  },
): void => {
  const field = castKitField(
    kitEffectState,
    combatant.characterId,
    { x, z },
    {
      id,
      isFollowing: true,
      nextTickSeconds: delaySeconds + initialTickSeconds,
      onTick: (tick) => onTick(tick, field),
      secondsRemaining,
      tickIntervalSeconds: intervalSeconds,
    },
  );
};

// Furina's behaviour: her strikes open Spiritbreath Thorn or Surging Blade, and her charged attack turns her Arkhe a frame
// After its hit. Salon Solitaire takes the Arkhe she holds: Ousia's bubble and Salon members, which drain the team as they
// Attack, or Pneuma's Singer of Many Waters, which heals the character on the field. Let the People Rejoice starts its
// Fanfare, which each change to a member's HP feeds. Ascensions 1 and 4 and Constellations 1, 2's Fanfare and 4 are built;
// Constellation 2's Max HP, 3, 5 and 6 are not
// Constellation 6 needs Center of Attention's 10 seconds and an infusion that outranks others, neither built
export const createFurinaKitBehaviour = ({
  kit,
  readFrames,
  readHit,
  readHits,
  readParameter,
  readParameters,
  readSeconds,
  readSecondsList,
}: KitRecordReader): KitBehaviour => {
  const arkhe = readHit("arkhe");
  const arkheCooldownSecondsList = readParameters("arkheHitCooldownSeconds");
  const surgingBladeCooldownSeconds = takeOne(arkheCooldownSecondsList, 0);
  const spiritbreathThornCooldownSeconds = takeOne(arkheCooldownSecondsList, 1);
  const ousiaBubble = readHit("ousiaBubble");
  const salonSeconds = readSeconds("salon");
  const pneumaSummonDelaySeconds = readSeconds("pneumaSummonDelay");
  const arkheSwitchSeconds = readSeconds("arkheSwitch");
  const salonMemberAttacks = readHits("salonMemberAttacks");
  const salonMemberInitialTickSecondsList = readSecondsList("salonMemberInitialTicks");
  const salonMemberIntervalSecondsList = readSecondsList("salonMemberIntervals");
  const salonMemberDrainedMaxHealthShares = readParameters("salonMemberDrainedMaxHealthShares");
  const salonMemberMultipliers = readParameters("salonMemberMultipliers");
  // Each Salon member's attack, schedule, drain and multiplier, in the order the record holds them: Surintendante
  // Chevalmarin's, Gentilhomme Usher's and Mademoiselle Crabaletta's
  const salonMembers = salonMemberAttacks.map((attack, index) => ({
    attack,
    drainedMaxHealthShare: takeOne(salonMemberDrainedMaxHealthShares, index),
    initialTickSeconds: takeOne(salonMemberInitialTickSecondsList, index),
    intervalSeconds: takeOne(salonMemberIntervalSecondsList, index),
    multiplier: takeOne(salonMemberMultipliers, index),
  }));
  const singerFlatHealth = readParameter("singerHealFlatHealth");
  const singerMaxHealthShare = readParameter("singerHealMaxHealthShare");
  const singerInitialTickSeconds = readSeconds("singerInitialTick");
  const singerIntervalFrames = readFrames("singerInterval");
  const fanfareMax = readParameter("fanfareMax");
  const fanfareHealthShare = readParameter("fanfareHealthSharePerPoint");
  const fanfareDamageBonusPerPoint = readParameter("fanfareDamageBonusPerPoint");
  const fanfareIncomingHealingBonusPerPoint = readParameter("fanfareIncomingHealingBonusPerPoint");
  const fanfareStartSeconds = readSeconds("fanfareStart");
  const fanfareGainDelaySeconds = readSeconds("fanfareGainDelay");
  const fanfareDebounceStartSeconds = readSeconds("fanfareDebounceStart");
  const fanfareDebounceSeconds = readSeconds("fanfareDebounce");
  type SalonMember = (typeof salonMembers)[number];

  // A strike that lands opens the Arkhe's hit from where the body stands, unless that Arkhe's cooldown runs
  const openArkheHit = ({ kitEffectState }: KitContext, { body, combatant }: KitStrike): void => {
    const { characterId } = combatant;
    const isPneuma = checkHasKitStatus(kitEffectState.effects, characterId, PNEUMA_STATUS_ID);
    const cooldownStatusId = isPneuma ? SURGING_BLADE_COOLDOWN_STATUS_ID : SPIRITBREATH_THORN_COOLDOWN_STATUS_ID;
    const cooldownSeconds = isPneuma ? surgingBladeCooldownSeconds : spiritbreathThornCooldownSeconds;
    if (!startKitCooldown(kitEffectState, characterId, cooldownStatusId, cooldownSeconds)) return;
    castKitSummon(kitEffectState, body, combatant, [arkhe], { attackTag: AttackTag.NormalAttack });
  };

  // A Salon member's attack on the enemy nearest its centre: it drains every member above half HP, then strikes the circle
  // Round that enemy once its attack has travelled, a tenth harder for each member it drained. With no enemy in reach it
  // Neither drains nor strikes
  const attackWithSalonMember = (
    tick: KitContext,
    combatant: Combatant,
    { attack, drainedMaxHealthShare, multiplier }: SalonMember,
    centre: GroundPoint,
  ): void => {
    const target = selectAttackTarget(
      kit.elementalSkill.targetingArea,
      { facing: 0, height: 0, position: centre },
      tick.enemyMap.values(),
    );
    if (!target) return;
    let drainedCount = 0;
    for (const memberId of getDeployedCharacterIds(tick.party)) {
      const member = tick.characterIdCombatantMap.get(memberId);
      if (!member || getPartyMember(tick.party, memberId).healthShare <= SALON_DRAINED_HEALTH_SHARE_MIN) continue;
      drainedCount++;
      changeKitMemberHealth(tick, combatant, memberId, -drainedMaxHealthShare * member.attributes.maxHealth);
    }
    const hit: KitHit = {
      ...attack,
      additiveBaseDamageBonus: createMaxHealthScaledBonus(
        multiplier * (1 + SALON_DAMAGE_BONUS_PER_DRAINED_MEMBER * drainedCount),
      ),
      damageBonus: getSalonDamageBonus(combatant),
      onStrike: (context, strike) => gainConstellation4Energy(context, strike.combatant),
    };
    castKitSummon(tick.kitEffectState, { facing: 0, height: 0, position: target.position }, combatant, [hit], {
      attackTag: AttackTag.ElementalSkill,
      id: SALON_ATTACK_SUMMON_ID,
    });
  };

  const castSalonMember = (
    kitEffectState: KitEffectState,
    combatant: Combatant,
    salonMember: SalonMember,
    centre: GroundPoint,
    delaySeconds: number,
    secondsRemaining: number,
  ): void =>
    castFollowingField(kitEffectState, combatant, centre, {
      delaySeconds,
      id: SALON_MEMBER_FIELD_ID,
      initialTickSeconds: salonMember.initialTickSeconds,
      intervalSeconds: salonMember.intervalSeconds,
      onTick: (tick, field) => {
        if (field.secondsRemaining > 0) attackWithSalonMember(tick, combatant, salonMember, field.centre);
      },
      secondsRemaining,
    });

  const castSinger = (
    kitEffectState: KitEffectState,
    combatant: Combatant,
    centre: GroundPoint,
    delaySeconds: number,
    secondsRemaining: number,
  ): void =>
    castFollowingField(kitEffectState, combatant, centre, {
      delaySeconds,
      id: SINGER_FIELD_ID,
      initialTickSeconds: singerInitialTickSeconds,
      // Ascension 4's cut is taken off the interval in whole frames, as gcsim rounds it
      intervalSeconds: toKitSeconds(Math.round(singerIntervalFrames * (1 - getSingerIntervalCut(combatant)))),
      onTick: (tick, field) => {
        if (field.secondsRemaining <= 0) return;
        changeKitMemberHealth(
          tick,
          combatant,
          tick.activeCombatant.characterId,
          singerFlatHealth + singerMaxHealthShare * combatant.attributes.maxHealth,
        );
        gainConstellation4Energy(tick, combatant);
      },
      secondsRemaining,
    });

  // Brings out the summons of the Arkhe she holds after the delay, for the seconds Salon Solitaire has left, in place of
  // The ones out
  const summonSalon = (
    kitEffectState: KitEffectState,
    combatant: Combatant,
    centre: GroundPoint,
    delaySeconds: number,
    secondsRemaining: number,
  ): void => {
    endSalon(kitEffectState, combatant.characterId);
    if (checkHasKitStatus(kitEffectState.effects, combatant.characterId, PNEUMA_STATUS_ID))
      castSinger(kitEffectState, combatant, centre, delaySeconds, secondsRemaining);
    else
      for (const salonMember of salonMembers)
        castSalonMember(kitEffectState, combatant, salonMember, centre, delaySeconds, secondsRemaining);
  };

  // The charged attack's turn of her Arkhe, Ousia to Pneuma or back, which hands Salon Solitaire to the other Arkhe's
  // Summons while it lasts
  const switchArkhe = (kitEffectState: KitEffectState, combatant: Combatant, centre: GroundPoint): void => {
    const { characterId } = combatant;
    const pneuma = findKitStatus(kitEffectState.effects, characterId, PNEUMA_STATUS_ID);
    if (pneuma) removeKitEffects(kitEffectState, (effect) => effect === pneuma);
    else
      addKitStatus(kitEffectState, characterId, { id: PNEUMA_STATUS_ID, secondsRemaining: Number.POSITIVE_INFINITY });
    const salon = findKitStatus(kitEffectState.effects, characterId, SALON_STATUS_ID);
    if (salon && salon.secondsRemaining > 0) summonSalon(kitEffectState, combatant, centre, 0, salon.secondsRemaining);
  };

  const getFanfareMax = ({ constellationCount }: Combatant): number =>
    fanfareMax + (constellationCount >= CONSTELLATION_1 ? CONSTELLATION_1_FANFARE_MAX_BONUS : 0);
  // What each Fanfare point gives every member: a DMG Bonus to all of its DMG and an Incoming Healing Bonus
  const fanfareBonusesPerPoint: [Attribute, number][] = [
    ...DAMAGE_BONUS_ATTRIBUTES.map((attribute): [Attribute, number] => [attribute, fanfareDamageBonusPerPoint]),
    [Attribute.IncomingHealingBonus, fanfareIncomingHealingBonusPerPoint],
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
  // A change to a member's HP while the Fanfare lasts gives Fanfare by the share changed, after the debounce's delay: the
  // First a moment on, opening the debounce's window a frame on, and those within the window as it closes, as gcsim
  // Estimates the game's debounce
  const gainFanfare = ({ kitEffectState }: KitContext, combatant: Combatant, healthShare: number): void => {
    const { characterId, constellationCount } = combatant;
    if (healthShare === 0 || !checkIsKitStatusActive(kitEffectState.effects, characterId, FANFARE_STATUS_ID)) return;
    const fanfare =
      (Math.abs(healthShare) / fanfareHealthShare) *
      (constellationCount >= CONSTELLATION_2 ? CONSTELLATION_2_FANFARE_MULTIPLIER : 1);
    const debounce = findKitStatus(kitEffectState.effects, characterId, FANFARE_DEBOUNCE_STATUS_ID);
    let delaySeconds = fanfareGainDelaySeconds;
    if (debounce && debounce.secondsRemaining > 0) delaySeconds = debounce.secondsRemaining;
    else
      scheduleKitTask(kitEffectState, characterId, fanfareDebounceStartSeconds, (tick) =>
        addKitStatus(tick.kitEffectState, characterId, {
          id: FANFARE_DEBOUNCE_STATUS_ID,
          secondsRemaining: fanfareDebounceSeconds,
        }),
      );
    scheduleKitTask(kitEffectState, characterId, delaySeconds, (tick) => {
      const fanfareStatus = findKitStatus(tick.kitEffectState.effects, characterId, FANFARE_STATUS_ID);
      if (fanfareStatus && fanfareStatus.secondsRemaining > 0)
        setFanfare(tick.kitEffectState, tick.party, combatant, fanfareStatus, (fanfareStatus.stacks ?? 0) + fanfare);
    });
  };

  const strike = { hits: [{ onStrike: openArkheHit }] };
  return {
    // The burst ends the Fanfare of the one before it as it is cast, and its own starts before its hit lands, so the hit
    // Takes Constellation 1's
    burst: {
      onStart: ({ activeCombatant: combatant, kitEffectState }) => {
        const { characterId, constellationCount } = combatant;
        for (const effect of kitEffectState.effects)
          if (
            (effect.kind === "status" && effect.characterId === characterId && effect.id === FANFARE_STATUS_ID) ||
            (effect.kind === "buff" && effect.source === FANFARE_BUFF_SOURCE)
          )
            effect.secondsRemaining = 0;
        scheduleKitTask(kitEffectState, characterId, fanfareStartSeconds, (tick) => {
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
    },
    // The charged attack turns her Arkhe a frame after its hit, and while Salon Solitaire lasts the other Arkhe's summons
    // Take over from the ones out
    chargedAttack: {
      onStart: ({ activeCombatant: combatant, body, kitEffectState }) =>
        scheduleKitTask(kitEffectState, combatant.characterId, arkheSwitchSeconds, (tick) =>
          switchArkhe(tick.kitEffectState, combatant, body.position),
        ),
    },
    normalAttacks: [strike, strike, strike, strike],
    // Each change to a member's HP feeds the Fanfare and may start Endless Waltz
    onKitEvent: (event, context, combatant) => {
      if (event.kind !== KitEventKind.HealthChanged) return;
      gainFanfare(context, combatant, event.healthShare);
      startEndlessWaltz(context, combatant, event);
    },
    // Salon Solitaire takes the Arkhe she holds as it starts: in Ousia its bubble and the Salon members, who come out as
    // The bubble strikes, and in Pneuma the Singer of Many Waters, after its delay. It lasts the Salon's seconds from then
    skill: {
      onStart: ({ activeCombatant: combatant, body, kitEffectState }) => {
        const { characterId } = combatant;
        const isPneuma = checkHasKitStatus(kitEffectState.effects, characterId, PNEUMA_STATUS_ID);
        const delaySeconds = isPneuma ? pneumaSummonDelaySeconds : ousiaBubble.hitmarkSeconds;
        const secondsRemaining = salonSeconds + delaySeconds;
        addKitStatus(kitEffectState, characterId, { id: SALON_STATUS_ID, secondsRemaining });
        if (!isPneuma)
          castKitSummon(kitEffectState, body, combatant, [ousiaBubble], { attackTag: AttackTag.ElementalSkill });
        summonSalon(kitEffectState, combatant, body.position, delaySeconds, secondsRemaining);
      },
    },
  };
};
