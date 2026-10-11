import type { TalentMultiplierMap } from "#src/models/character/TalentMultiplierMap";
import type { Kit } from "#src/models/kit/Kit";
import type { KitAction } from "#src/models/kit/KitAction";
import type { KitContext } from "#src/models/kit/KitContext";
import type { KitHit } from "#src/models/kit/KitHit";

import { AttackTag } from "#src/models/combat/AttackTag";
import { InternalCooldownTag } from "#src/models/combat/InternalCooldownTag";
import { Element } from "#src/models/Element";
import { TALENT_START_LEVEL } from "#src/services/character/constants";
import { PLUNGE_HIT_AREAS, SKILL_TARGETING_AREA, STRIKE_TARGETING_AREA } from "#src/services/kit/constants";
import { createBoxReach } from "#src/services/kit/createBoxReach";
import { createCircleReach } from "#src/services/kit/createCircleReach";
import { addKitEffect } from "#src/services/kit/effects/addKitEffect";
import { checkHasKitStatus } from "#src/services/kit/effects/checkHasKitStatus";
import { createKitSummon } from "#src/services/kit/effects/createKitSummon";
import { enterKitStance } from "#src/services/kit/effects/enterKitStance";
import { getTalentMultiplier } from "#src/services/kit/getTalentMultiplier";
import { gainPartyMemberEnergy } from "#src/services/party/gainPartyMemberEnergy";

// Durin's proud skill groups, read at his talent level. The attack group holds his four strikes at 0 to 4 (the second strike's
// Two hits at 2 and 3), the charged attack at 5 and its stamina at 6, and the plunges' collision, low and high at 7, 8 and 9.
// The skill group holds Confirmation of Purity at 0, Denial of Darkness's three hits at 1 to 3, the energy each recast gives at
// 4, and the skill's cooldown at 5. The burst group holds As the Light Shifts's three white hits at 0 to 2, As the Stars
// Smolder's three black hits at 3 to 5, the white and black Dragon's DoT at 6 and 7, its cooldown at 10 and its energy cost at 11
const DURIN_ATTACK_GROUP_ID = 12331;
const DURIN_SKILL_GROUP_ID = 12332;
const DURIN_BURST_GROUP_ID = 12339;

export const DURIN_CHARACTER_ID = 10_000_123;

// Measured: gcsim (MIT) durin/attack.go, each strike's hitmarks and the frame its action cancels at by default, and its reach.
// The first three strikes are circles centred ahead of the body, and the fourth a box, each offset as gcsim gives it. The
// Second strike's hit is at 9 frames and its circle at 2.15 metres, and the third's two hits share a circle of 2.4 metres
// Https://github.com/genshinsim/gcsim/tree/main/internal/characters/durin
const NORMAL_ATTACK_STRIKES: {
  cancelFrames: number;
  hits: { hitArea: KitHit["hitArea"]; hitmarkFrames: number; index: number }[];
}[] = [
  { cancelFrames: 29, hits: [{ hitArea: createCircleReach(0.3, 2.15), hitmarkFrames: 11, index: 0 }] },
  { cancelFrames: 30, hits: [{ hitArea: createCircleReach(0.6, 2.15), hitmarkFrames: 9, index: 1 }] },
  {
    cancelFrames: 55,
    hits: [
      { hitArea: createCircleReach(0.4, 2.4), hitmarkFrames: 14, index: 2 },
      { hitArea: createCircleReach(0.4, 2.4), hitmarkFrames: 37, index: 3 },
    ],
  },
  { cancelFrames: 66, hits: [{ hitArea: createBoxReach(-0.6, 3.3, 4.8), hitmarkFrames: 38, index: 4 }] },
];

// Measured: gcsim (MIT) durin/charge.go, the charged attack's circle of radius 2.5 centred 0.8 metres ahead at its hitmark of 17
// Frames, in an animation of 58 frames. It is Normal Attack DMG, and it does not change in the stance
// Https://github.com/genshinsim/gcsim/tree/main/internal/characters/durin
const CHARGED_ATTACK_FRAMES = 58;
const CHARGED_ATTACK_HITMARK_FRAMES = 17;
const CHARGED_ATTACK_HIT_AREA = createCircleReach(0.8, 2.5);

// Measured: gcsim (MIT) durin/skill.go, Tap E's animation of 49 frames, which deals no damage of its own: it opens the window
// Of six seconds that the recasts come in. Its cooldown is the table's, 12 seconds
// Https://github.com/genshinsim/gcsim/tree/main/internal/characters/durin
const SKILL_PRESS_FRAMES = 49;
const SKILL_WINDOW_SECONDS = 6;

// Measured: gcsim (MIT) durin/skill.go, Confirmation of Purity's animation of 83 frames and its hit at 35, a circle of radius 4.5
// Centred 1.2 metres ahead. It is the recast a skill press plays inside the window
// Https://github.com/genshinsim/gcsim/tree/main/internal/characters/durin
const WHITE_RECAST_FRAMES = 83;
const WHITE_RECAST_HITMARK_FRAMES = 35;
const WHITE_RECAST_HIT_AREA = createCircleReach(1.2, 4.5);

// Measured: gcsim (MIT) durin/skill.go, Denial of Darkness's animation of 67 frames and its three hits at 32, 37 and 42, each a
// Box 3 metres wide and 7 long, anchored 3 metres behind the body. It is the recast a normal attack plays inside the window
// Https://github.com/genshinsim/gcsim/tree/main/internal/characters/durin
const BLACK_RECAST_FRAMES = 67;
const BLACK_RECAST_HITMARK_FRAMES = [32, 37, 42];
const BLACK_RECAST_HIT_AREA = createBoxReach(-3, 3, 7);

// Measured: gcsim (MIT) durin/skill.go, the recasts' Denial and Confirmation both last 30 seconds, and the black one sets the
// Burst to As the Stars Smolder until a white recast ends it. A recast also gives the skill's energy, once every six seconds
// Https://github.com/genshinsim/gcsim/tree/main/internal/characters/durin
const BLACK_STATUS_SECONDS = 30;
const BLACK_STATUS_ID = "denial-of-darkness";
const SKILL_ENERGY_ICD_SECONDS = 6;
const SKILL_ENERGY_ICD_STATUS_ID = "durin-skill-energy-icd";

// Measured: gcsim (MIT) durin/burst.go, As the Light Shifts's three hits at 97, 121 and 154 frames, each a circle of radius 6.5
// Round the primary target, in an animation of 104 frames. As the Stars Smolder's three black hits share those hitmarks and
// Reach. Each burst's Dragon ticks on the primary target for its DoT, a circle of 3.5 metres for the white and of 1.5 for the
// Black, with the black's ticks travelling 9 frames after each tick, gcsim's default travel
// Https://github.com/genshinsim/gcsim/tree/main/internal/characters/durin
const BURST_FRAMES = 104;
const BURST_INITIAL_HITMARK_FRAMES = [97, 97 + 24, 154];
const BURST_HIT_AREA = createCircleReach(0, 6.5);
const WHITE_DRAGON = {
  firstTickFrames: 155.2,
  hitArea: createCircleReach(0, 3.5),
  intervalFrames: 58.8,
  ticks: 20,
  travelFrames: 0,
};
const BLACK_DRAGON = {
  firstTickFrames: 175.4,
  hitArea: createCircleReach(0, 1.5),
  intervalFrames: 73.6,
  ticks: 16,
  // The black ticks travel 9 frames after each tick, gcsim's default travel, as a hit lands on its tick plus that
  travelFrames: 9,
};
const DRAGON_SUMMON_ID = "durin-dragon";

// Provisional: gcsim has no plunge file for Durin, so his plunges take the timings and poise of Bennett's, as Flins's and
// Lauma's do. His multipliers are his own table's
// Https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/bennett/plunge.go
const PLUNGE_COLLISION_HITMARK_FRAMES = 30;
const LOW_PLUNGE_HITMARK_FRAMES = 36;
const LOW_PLUNGE_FRAMES = 67;
const LOW_PLUNGE_POISE_DAMAGE = 100;
const HIGH_PLUNGE_HITMARK_FRAMES = 38;
const HIGH_PLUNGE_FRAMES = 68;
const HIGH_PLUNGE_POISE_DAMAGE = 150;

// The recasts end the window's stance, as gcsim deletes the window when either is cast
const endWindow = ({ activeCombatant: combatant, kitEffectState }: KitContext): void => {
  for (const effect of kitEffectState.effects)
    if (effect.kind === "stance" && effect.characterId === combatant.characterId) effect.secondsRemaining = 0;
};

const createPlunge = (hit: KitHit, animationFrames: number): KitAction => ({
  hits: [hit],
  seconds: animationFrames / 60,
  targetingArea: STRIKE_TARGETING_AREA,
});

// Not built yet: Durin's passives and constellations, which read the burst's state and the Burning and Pyro reactions the
// Framework does not price for a passive yet, and the Pyro particles of his recasts, which need a particle a hit drops with
// Its own delay and internal cooldown, which no hook gives a kit yet. His energy from each recast is built.
export const createDurinKit = (talentMultiplierMap: TalentMultiplierMap): Kit => {
  const attackMultiplier = (index: number): number =>
    getTalentMultiplier(talentMultiplierMap, DURIN_ATTACK_GROUP_ID, TALENT_START_LEVEL, index);
  const skillMultiplier = (index: number): number =>
    getTalentMultiplier(talentMultiplierMap, DURIN_SKILL_GROUP_ID, TALENT_START_LEVEL, index);
  const burstMultiplier = (index: number): number =>
    getTalentMultiplier(talentMultiplierMap, DURIN_BURST_GROUP_ID, TALENT_START_LEVEL, index);

  const normalAttacks: KitAction[] = NORMAL_ATTACK_STRIKES.map(({ cancelFrames, hits }) => ({
    hits: hits.map(({ hitArea, hitmarkFrames, index }): KitHit => ({
      hitArea,
      hitmarkSeconds: hitmarkFrames / 60,
      internalCooldownTag: InternalCooldownTag.NormalAttack,
      poiseDamage: 0,
      talentMultiplier: attackMultiplier(index),
    })),
    seconds: cancelFrames / 60,
    targetingArea: STRIKE_TARGETING_AREA,
  }));

  const chargedAttack: KitAction = {
    hits: [
      {
        hitArea: CHARGED_ATTACK_HIT_AREA,
        hitmarkSeconds: CHARGED_ATTACK_HITMARK_FRAMES / 60,
        poiseDamage: 0,
        talentMultiplier: attackMultiplier(5),
      },
    ],
    seconds: CHARGED_ATTACK_FRAMES / 60,
    targetingArea: STRIKE_TARGETING_AREA,
  };

  // Each recast gives the skill's energy once every six seconds, as gcsim's energy ICD does, and the energy is the table's
  const gainRecastEnergy = ({ activeCombatant: combatant, kitEffectState, party }: KitContext): void => {
    if (checkHasKitStatus(kitEffectState.effects, combatant.characterId, SKILL_ENERGY_ICD_STATUS_ID)) return;
    gainPartyMemberEnergy(party, combatant, skillMultiplier(4));
    addKitEffect(kitEffectState, {
      characterId: combatant.characterId,
      id: SKILL_ENERGY_ICD_STATUS_ID,
      kind: "status",
      secondsRemaining: SKILL_ENERGY_ICD_SECONDS,
    });
  };

  const whiteRecast: KitAction = {
    hits: [
      {
        element: Element.Pyro,
        gauge: 1,
        hitArea: WHITE_RECAST_HIT_AREA,
        hitmarkSeconds: WHITE_RECAST_HITMARK_FRAMES / 60,
        internalCooldownTag: InternalCooldownTag.ElementalSkill,
        poiseDamage: 0,
        talentMultiplier: skillMultiplier(0),
      },
    ],
    onStart: (start) => {
      endWindow(start);
      gainRecastEnergy(start);
      for (const effect of start.kitEffectState.effects)
        if (
          effect.kind === "status" &&
          effect.id === BLACK_STATUS_ID &&
          effect.characterId === start.activeCombatant.characterId
        )
          effect.secondsRemaining = 0;
    },
    seconds: WHITE_RECAST_FRAMES / 60,
    targetingArea: SKILL_TARGETING_AREA,
  };

  // Denial of Darkness is the window's normal attack, a stance's one string of three hits, so it is the stance's normal
  // Attacks, though its hits are Elemental Art DMG, gcsim's AttackTagElementalArt in durin/skill.go
  const blackRecast: KitAction = {
    hits: BLACK_RECAST_HITMARK_FRAMES.map((hitmarkFrames, index) => ({
      attackTag: AttackTag.ElementalSkill,
      element: Element.Pyro,
      gauge: 1,
      hitArea: BLACK_RECAST_HIT_AREA,
      hitmarkSeconds: hitmarkFrames / 60,
      internalCooldownTag: InternalCooldownTag.ElementalSkill,
      poiseDamage: 0,
      talentMultiplier: skillMultiplier(index + 1),
    })),
    onStart: (start) => {
      endWindow(start);
      gainRecastEnergy(start);
      addKitEffect(start.kitEffectState, {
        characterId: start.activeCombatant.characterId,
        id: BLACK_STATUS_ID,
        kind: "status",
        secondsRemaining: BLACK_STATUS_SECONDS,
      });
    },
    seconds: BLACK_RECAST_FRAMES / 60,
    targetingArea: SKILL_TARGETING_AREA,
  };

  // Tap E starts the window's stance, whose normal attacks are Denial of Darkness, and whose skill press is the chain's
  // White recast, which the chain plays whatever the cooldown Tap E set
  const elementalSkill: KitAction = {
    hits: [],
    onStart: ({ activeCombatant: combatant, kitEffectState }) =>
      enterKitStance(
        kitEffectState,
        combatant,
        {
          chargedAttack,
          chargedAttackStamina: attackMultiplier(6),
          elementalBurst,
          elementalSkill,
          normalAttacks: [blackRecast],
        },
        SKILL_WINDOW_SECONDS,
      ),
    seconds: SKILL_PRESS_FRAMES / 60,
    targetingArea: SKILL_TARGETING_AREA,
  };

  // The Dragon's DoT ticks at each frame of its schedule, and a new burst's Dragon ends the one of the same character
  const createDragonAction = (
    dragon: typeof BLACK_DRAGON | typeof WHITE_DRAGON,
    talentMultiplier: number,
    initialHits: KitHit[],
  ): KitAction => ({
    hits: initialHits,
    onStart: ({ activeCombatant: combatant, body, kitEffectState }, target) => {
      for (const effect of kitEffectState.effects)
        if (
          effect.kind === "summon" &&
          effect.id === DRAGON_SUMMON_ID &&
          effect.combatant.characterId === combatant.characterId
        )
          effect.secondsRemaining = 0;
      const hits: KitHit[] = Array.from({ length: dragon.ticks }, (_value, tick) => ({
        element: Element.Pyro,
        gauge: 1,
        hitArea: dragon.hitArea,
        hitmarkSeconds: (Math.ceil(dragon.firstTickFrames + dragon.intervalFrames * tick) + dragon.travelFrames) / 60,
        poiseDamage: 0,
        talentMultiplier,
      }));
      addKitEffect(kitEffectState, {
        ...createKitSummon(target ? { facing: 0, height: 0, position: target.position } : body, combatant, hits),
        id: DRAGON_SUMMON_ID,
      });
    },
    seconds: BURST_FRAMES / 60,
    targetingArea: SKILL_TARGETING_AREA,
  });

  const burstHits = (firstIndex: number, hitmarkFrames: number[]): KitHit[] =>
    hitmarkFrames.map((frames, offset) => ({
      element: Element.Pyro,
      gauge: 1,
      hitArea: BURST_HIT_AREA,
      hitmarkSeconds: frames / 60,
      poiseDamage: 0,
      talentMultiplier: burstMultiplier(firstIndex + offset),
    }));

  const elementalBurst = createDragonAction(
    WHITE_DRAGON,
    burstMultiplier(6),
    burstHits(0, BURST_INITIAL_HITMARK_FRAMES),
  );
  const blackBurst = createDragonAction(BLACK_DRAGON, burstMultiplier(7), burstHits(3, BURST_INITIAL_HITMARK_FRAMES));

  return {
    burstCooldownSeconds: burstMultiplier(10),
    burstEnergyCost: burstMultiplier(11),
    chargedAttack,
    chargedAttackStamina: attackMultiplier(6),
    elementalBurst,
    elementalBurstVariant: {
      action: blackBurst,
      checkIsActive: ({ activeCombatant: combatant, kitEffectState }) =>
        checkHasKitStatus(kitEffectState.effects, combatant.characterId, BLACK_STATUS_ID),
    },
    elementalSkill,
    elementalSkillChain: { followUps: [whiteRecast], windowSeconds: SKILL_WINDOW_SECONDS },
    highPlunge: createPlunge(
      {
        hitArea: PLUNGE_HIT_AREAS.high,
        hitmarkSeconds: HIGH_PLUNGE_HITMARK_FRAMES / 60,
        isBlunt: true,
        poiseDamage: HIGH_PLUNGE_POISE_DAMAGE,
        talentMultiplier: attackMultiplier(9),
      },
      HIGH_PLUNGE_FRAMES,
    ),
    lowPlunge: createPlunge(
      {
        hitArea: PLUNGE_HIT_AREAS.low,
        hitmarkSeconds: LOW_PLUNGE_HITMARK_FRAMES / 60,
        isBlunt: true,
        poiseDamage: LOW_PLUNGE_POISE_DAMAGE,
        talentMultiplier: attackMultiplier(8),
      },
      LOW_PLUNGE_FRAMES,
    ),
    normalAttacks,
    plungeCollision: {
      hitArea: PLUNGE_HIT_AREAS.collision,
      hitmarkSeconds: PLUNGE_COLLISION_HITMARK_FRAMES / 60,
      poiseDamage: 0,
      talentMultiplier: attackMultiplier(7),
    },
    skillCooldownSeconds: skillMultiplier(5),
  };
};
