import type { TalentMultiplierMap } from "#src/models/character/TalentMultiplierMap";
import type { AttackArea } from "#src/models/kit/AttackArea";
import type { Combatant } from "#src/models/kit/Combatant";
import type { Kit } from "#src/models/kit/Kit";
import type { KitAction } from "#src/models/kit/KitAction";
import type { KitBuff } from "#src/models/kit/KitBuff";
import type { KitContext } from "#src/models/kit/KitContext";
import type { KitEvent } from "#src/models/kit/KitEvent";
import type { KitField } from "#src/models/kit/KitField";
import type { KitHit } from "#src/models/kit/KitHit";
import type { KitStatus } from "#src/models/kit/KitStatus";
import type { KitStrike } from "#src/models/kit/KitStrike";

import { Attribute } from "#src/models/character/Attribute";
import { AttackTag } from "#src/models/combat/AttackTag";
import { Element } from "#src/models/Element";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { TALENT_START_LEVEL } from "#src/services/character/constants";
import { PLUNGE_HIT_AREAS, SKILL_TARGETING_AREA, STRIKE_TARGETING_AREA } from "#src/services/kit/constants";
import { createTargetedHitArea } from "#src/services/kit/createTargetedHitArea";
import { addKitEffect } from "#src/services/kit/effects/addKitEffect";
import { checkHasKitStatus } from "#src/services/kit/effects/checkHasKitStatus";
import { createKitSummon } from "#src/services/kit/effects/createKitSummon";
import { getTalentMultiplier } from "#src/services/kit/getTalentMultiplier";
import { gainPartyMemberEnergy } from "#src/services/party/gainPartyMemberEnergy";

// Ororon's proud skill groups, read at his talent level. The attack group holds the three strikes at 0 to 2, the fully
// Charged Aimed Shot at 4 and the plunges' collision, low and high at 5, 6 and 7. The skill group holds the Spirit Orb's hit
// At 0 and its cooldown at 1. The burst group holds Dark Voices' Echo's ritual hit at 0, its Soundwave Collision at 1, its
// Seconds at 2, its cooldown at 3 and its energy cost at 4
const ORORON_ATTACK_GROUP_ID = 10531;
const ORORON_SKILL_GROUP_ID = 10532;
const ORORON_BURST_GROUP_ID = 10539;

// Measured: gcsim (MIT, main) ororon/attack.go, each strike's hitmark and the frame its action cancels at, its box
// Reaching a metre from the body, which a circle of radius 1 round the body prices, and travelling 10 frames to the target
// https://github.com/genshinsim/gcsim/blob/main/internal/characters/ororon/attack.go
const STRIKE_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 1 });
const ARROW_TRAVEL_FRAMES = 10;
const NORMAL_ATTACK_FRAMES = [
  { cancelFrames: 32, hitmarkFrames: 12 },
  { cancelFrames: 53, hitmarkFrames: 10 },
  { cancelFrames: 70, hitmarkFrames: 20 },
];

// Measured: gcsim (MIT, main) ororon/aimed.go, the fully charged Aimed Shot's animation at 85 frames and its arrow at 84,
// Travelling 10 frames to its target
// https://github.com/genshinsim/gcsim/blob/main/internal/characters/ororon/aimed.go
const FULL_CHARGE_FRAMES = 85;
const FULL_CHARGE_HITMARK_FRAMES = 84 + ARROW_TRAVEL_FRAMES;

// Measured: gcsim (MIT, main) ororon/skill.go, Spirit Orb's animation at 31 frames and its hit at 31, travelling 10 frames
// To its primary target, with its cooldown the table's. gcsim bounces it to up to three more enemies, which is not built
// https://github.com/genshinsim/gcsim/blob/main/internal/characters/ororon/skill.go
const SPIRIT_ORB_FRAMES = 31;
const SPIRIT_ORB_HITMARK_FRAMES = 31 + ARROW_TRAVEL_FRAMES;
// The orb's circle of radius 0.6 round its target, which a targeted reach prices as the skill's targeting radius plus it
const SPIRIT_ORB_HIT_AREA = createTargetedHitArea(SKILL_TARGETING_AREA, 0.6);

// Measured: gcsim (MIT, main) ororon/burst.go, Dark Voices' Echo's animation at 62 frames, its ritual at 36 as a circle of
// Radius 6.5 round the body, then its field of radius 6.5 for the table's seconds, ticking every 60 frames from the cast
// https://github.com/genshinsim/gcsim/blob/main/internal/characters/ororon/burst.go
const BURST_FRAMES = 62;
const RITUAL_HITMARK_FRAMES = 36;
const RITUAL_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 6.5 });
const FIELD_RADIUS = 6.5;
const SOUNDWAVE_TICK_FRAMES = 60;
// From Constellation 4 each soundwave's tick comes 75 frames apart rather than 60, as gcsim's c4BurstInterval gives
const CONSTELLATION_4_TICK_FRAMES = 45;
const CONSTELLATION_4 = 4;

// Provisional: gcsim gives Ororon's strikes, Aimed Shot, Spirit Orb, ritual, soundwave and plunges no poise, so they read 0
// Until a source gives them
const NO_POISE_DAMAGE = 0;

// Measured: gcsim (MIT, main) ororon/cons.go, Constellation 2's 8% Electro DMG Bonus for each enemy a burst's ritual or
// Soundwave hits, up to 32%, for the burst's nine seconds from its cast. It is refreshed by the burst, not extended by a hit
// https://github.com/genshinsim/gcsim/blob/main/internal/characters/ororon/cons.go
const CONSTELLATION_2 = 2;
const CONSTELLATION_2_STACK = 0.08;
const CONSTELLATION_2_MAXIMUM = 0.32;
const CONSTELLATION_2_SOURCE = "ororon-c2";

// Measured: gcsim (MIT, main) ororon/asc.go, Ascension 4's energy: each normal attack, charged attack or plunge of the
// Active character that hits an enemy while the Spirit Orb's hit has set it going gives 3 energy to the active character and
// To Ororon, up to three times, with a second between them. The orb's hit sets it going for 15 seconds
// https://github.com/genshinsim/gcsim/blob/main/internal/characters/ororon/asc.go
const ASCENSION_4 = 4;
const ASCENSION_4_ENERGY = 3;
const ASCENSION_4_MAXIMUM_TRIGGERS = 3;
const ASCENSION_4_SECONDS = 15;
const ASCENSION_4_INTERNAL_COOLDOWN_SECONDS = 1;
const ASCENSION_4_STATUS_ID = "ororon-a4";
const ASCENSION_4_COOLDOWN_STATUS_ID = "ororon-a4-icd";

export const ORORON_CHARACTER_ID = 10_000_105;

const addConstellation2Stack = ({ kitEffectState }: KitContext, { combatant }: KitStrike): void => {
  if (combatant.constellationCount < CONSTELLATION_2) return;
  const earlier = kitEffectState.effects.find(
    (effect): effect is KitBuff =>
      effect.kind === "buff" &&
      effect.characterId === combatant.characterId &&
      effect.source === CONSTELLATION_2_SOURCE,
  );
  if (earlier === undefined) return;
  addKitEffect(kitEffectState, {
    ...earlier,
    amount: Math.min(earlier.amount + CONSTELLATION_2_STACK, CONSTELLATION_2_MAXIMUM),
  });
};
const onKitEvent = (
  event: KitEvent,
  { activeCombatant, kitEffectState, party }: KitContext,
  combatant: Combatant,
): void => {
  if (event.kind !== KitEventKind.DamageTaken || combatant.ascension < ASCENSION_4) return;
  const { attackTag, striker } = event;
  if (striker.characterId !== activeCombatant.characterId) return;
  if (
    attackTag !== AttackTag.NormalAttack &&
    attackTag !== AttackTag.ChargedAttack &&
    attackTag !== AttackTag.PlungingAttack
  )
    return;
  const status = kitEffectState.effects.find(
    (effect): effect is KitStatus =>
      effect.kind === "status" && effect.characterId === combatant.characterId && effect.id === ASCENSION_4_STATUS_ID,
  );
  if (
    status === undefined ||
    checkHasKitStatus(kitEffectState.effects, combatant.characterId, ASCENSION_4_COOLDOWN_STATUS_ID)
  )
    return;
  addKitEffect(kitEffectState, {
    characterId: combatant.characterId,
    id: ASCENSION_4_COOLDOWN_STATUS_ID,
    kind: "status",
    secondsRemaining: ASCENSION_4_INTERNAL_COOLDOWN_SECONDS,
  });
  gainPartyMemberEnergy(party, activeCombatant, ASCENSION_4_ENERGY);
  if (activeCombatant.characterId !== combatant.characterId)
    gainPartyMemberEnergy(party, combatant, ASCENSION_4_ENERGY);
  const triggers = (status.stacks ?? 0) + 1;
  if (triggers < ASCENSION_4_MAXIMUM_TRIGGERS) addKitEffect(kitEffectState, { ...status, stacks: triggers });
  else kitEffectState.effects = kitEffectState.effects.filter((effect) => effect !== status);
};
// Ororon's first kit, at talent level 1: three strikes, a fully charged Aimed Shot, the Spirit Orb's first hit, Dark Voices'
// Echo with its ritual and soundwave field, and a collision and two plunges. Constellations 2 and 4 and Ascension 4 are
// Built. The Spirit Orb's bounce, Ascension 1 and Constellations 1 and 6 wait on Hypersense and a chained hit, and Constellation 4's
// Energy restore on the ritual's hit
export const createOroronKit = (talentMultiplierMap: TalentMultiplierMap): Kit => {
  const createNormalAttack = (
    { cancelFrames, hitmarkFrames }: (typeof NORMAL_ATTACK_FRAMES)[number],
    index: number,
  ): KitAction => ({
    hits: [
      {
        hitArea: STRIKE_HIT_AREA,
        hitmarkSeconds: (hitmarkFrames + ARROW_TRAVEL_FRAMES) / 60,
        poiseDamage: NO_POISE_DAMAGE,
        talentMultiplier: getTalentMultiplier(talentMultiplierMap, ORORON_ATTACK_GROUP_ID, TALENT_START_LEVEL, index),
      },
    ],
    seconds: cancelFrames / 60,
    targetingArea: STRIKE_TARGETING_AREA,
  });
  const ritualHit: KitHit = {
    element: Element.Electro,
    gauge: 1,
    hitArea: RITUAL_HIT_AREA,
    hitmarkSeconds: RITUAL_HITMARK_FRAMES / 60,
    onStrike: addConstellation2Stack,
    poiseDamage: NO_POISE_DAMAGE,
    talentMultiplier: getTalentMultiplier(talentMultiplierMap, ORORON_BURST_GROUP_ID, TALENT_START_LEVEL, 0),
  };
  const soundwaveHit: KitHit = {
    element: Element.Electro,
    gauge: 1,
    hitArea: RITUAL_HIT_AREA,
    hitmarkSeconds: 0,
    onStrike: addConstellation2Stack,
    poiseDamage: NO_POISE_DAMAGE,
    talentMultiplier: getTalentMultiplier(talentMultiplierMap, ORORON_BURST_GROUP_ID, TALENT_START_LEVEL, 1),
  };
  const fullyChargedArrowHit: KitHit = {
    element: Element.Electro,
    gauge: 1,
    hitArea: STRIKE_HIT_AREA,
    hitmarkSeconds: FULL_CHARGE_HITMARK_FRAMES / 60,
    poiseDamage: NO_POISE_DAMAGE,
    talentMultiplier: getTalentMultiplier(talentMultiplierMap, ORORON_ATTACK_GROUP_ID, TALENT_START_LEVEL, 4),
  };
  const spiritOrbHit: KitHit = {
    element: Element.Electro,
    gauge: 1,
    hitArea: SPIRIT_ORB_HIT_AREA,
    hitmarkSeconds: SPIRIT_ORB_HITMARK_FRAMES / 60,
    onStrike: ({ kitEffectState }, { combatant }) => {
      if (combatant.ascension < ASCENSION_4) return;
      addKitEffect(kitEffectState, {
        characterId: combatant.characterId,
        id: ASCENSION_4_STATUS_ID,
        kind: "status",
        secondsRemaining: ASCENSION_4_SECONDS,
        stacks: 0,
      });
    },
    poiseDamage: NO_POISE_DAMAGE,
    talentMultiplier: getTalentMultiplier(talentMultiplierMap, ORORON_SKILL_GROUP_ID, TALENT_START_LEVEL, 0),
  };
  const createPlungeHit = (hitArea: AttackArea, multiplierIndex: number): KitHit => ({
    hitArea,
    hitmarkSeconds: 0,
    poiseDamage: NO_POISE_DAMAGE,
    talentMultiplier: getTalentMultiplier(
      talentMultiplierMap,
      ORORON_ATTACK_GROUP_ID,
      TALENT_START_LEVEL,
      multiplierIndex,
    ),
  });
  return {
    burstCooldownSeconds: getTalentMultiplier(talentMultiplierMap, ORORON_BURST_GROUP_ID, TALENT_START_LEVEL, 3),
    burstEnergyCost: getTalentMultiplier(talentMultiplierMap, ORORON_BURST_GROUP_ID, TALENT_START_LEVEL, 4),
    chargedAttack: {
      hits: [fullyChargedArrowHit],
      isAimed: true,
      seconds: FULL_CHARGE_FRAMES / 60,
      targetingArea: STRIKE_TARGETING_AREA,
    },
    chargedAttackStamina: 0,
    elementalBurst: {
      hits: [ritualHit],
      onStart: ({ activeCombatant: combatant, body, kitEffectState }) => {
        if (combatant.constellationCount >= CONSTELLATION_2)
          addKitEffect(kitEffectState, {
            amount: CONSTELLATION_2_STACK,
            attribute: Attribute.ElectroDamageBonus,
            characterId: combatant.characterId,
            kind: "buff",
            secondsRemaining: getTalentMultiplier(talentMultiplierMap, ORORON_BURST_GROUP_ID, TALENT_START_LEVEL, 2),
            source: CONSTELLATION_2_SOURCE,
          });
        const tickSeconds =
          (combatant.constellationCount >= CONSTELLATION_4 ? CONSTELLATION_4_TICK_FRAMES : SOUNDWAVE_TICK_FRAMES) / 60;
        const field: KitField = {
          centre: { x: body.position.x, z: body.position.z },
          characterId: combatant.characterId,
          kind: "field",
          nextTickSeconds: tickSeconds,
          onTick: ({ kitEffectState: tickEffectState }) => {
            addKitEffect(tickEffectState, createKitSummon(body, combatant, [soundwaveHit]));
          },
          radius: FIELD_RADIUS,
          secondsRemaining: getTalentMultiplier(talentMultiplierMap, ORORON_BURST_GROUP_ID, TALENT_START_LEVEL, 2),
          tickIndex: 0,
          tickIntervalSeconds: tickSeconds,
        };
        addKitEffect(kitEffectState, field);
      },
      seconds: BURST_FRAMES / 60,
      targetingArea: SKILL_TARGETING_AREA,
    },
    elementalSkill: { hits: [spiritOrbHit], seconds: SPIRIT_ORB_FRAMES / 60, targetingArea: SKILL_TARGETING_AREA },
    highPlunge: { hits: [createPlungeHit(PLUNGE_HIT_AREAS.high, 7)], seconds: 0, targetingArea: STRIKE_TARGETING_AREA },
    lowPlunge: { hits: [createPlungeHit(PLUNGE_HIT_AREAS.low, 6)], seconds: 0, targetingArea: STRIKE_TARGETING_AREA },
    normalAttacks: NORMAL_ATTACK_FRAMES.map((frames, index) => createNormalAttack(frames, index)),
    onKitEvent,
    plungeCollision: createPlungeHit(PLUNGE_HIT_AREAS.collision, 5),
    skillCooldownSeconds: getTalentMultiplier(talentMultiplierMap, ORORON_SKILL_GROUP_ID, TALENT_START_LEVEL, 1),
  };
};
