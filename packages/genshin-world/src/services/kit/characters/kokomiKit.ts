import type { KitActionBehaviour } from "#src/models/kit/KitActionBehaviour";
import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitContext } from "#src/models/kit/KitContext";
import type { KitEffect } from "#src/models/kit/KitEffect";
import type { KitHit } from "#src/models/kit/KitHit";
import type { KitHitBehaviour } from "#src/models/kit/KitHitBehaviour";
import type { KitRecordReader } from "#src/models/kit/KitRecordReader";
import type { KitStrike } from "#src/models/kit/KitStrike";

import { Attribute } from "#src/models/character/Attribute";
import { createAheadBody } from "#src/services/kit/createAheadBody";
import { createMaxHealthScaledBonus } from "#src/services/kit/createMaxHealthScaledBonus";
import { castKitField } from "#src/services/kit/effects/castKitField";
import { castKitSummon } from "#src/services/kit/effects/castKitSummon";
import { changeKitMemberHealth } from "#src/services/kit/effects/changeKitMemberHealth";
import { enterKitStance } from "#src/services/kit/effects/enterKitStance";
import { findKitStance } from "#src/services/kit/effects/findKitStance";
import { startKitCooldown } from "#src/services/kit/effects/startKitCooldown";
import { gainPartyMemberEnergy } from "#src/services/party/gainPartyMemberEnergy";

// Measured: gcsim (MIT) kokomi/skill.go, Bake-Kurage's heal lands on the active character while it stands within a circle
// Of radius 6 whose centre lies 3 metres ahead, every tick, for 12.5 seconds
// Https://github.com/genshinsim/gcsim/blob/main/internal/characters/kokomi/skill.go
const SKILL_DURATION_SECONDS = 12.5;
const SKILL_CENTRE_METRES = 3;
const SKILL_RADIUS = 6;
const ASCENSION_1 = 1;
// Measured: gcsim (MIT) kokomi/cons.go, Constellation 4's energy: while she dons the garment, each normal attack that hits an
// Opponent restores 0.8 energy to her, once every 0.2 seconds
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/kokomi/cons.go
const CONSTELLATION_4_ENERGY = 0.8;
const CONSTELLATION_4_ENERGY_SECONDS = 0.2;
const CONSTELLATION_4_ENERGY_STATUS_ID = "kokomi-c4-energy";
// Measured: gcsim (MIT) kokomi/burst.go, Ceremonial Garment lasts ten seconds
// Https://github.com/genshinsim/gcsim/blob/main/internal/characters/kokomi/burst.go
const GARMENT_SECONDS = 10;
// Measured: gcsim (MIT) kokomi/asc.go, Song of Pearls adds 15% of her Healing Bonus, of her Max HP, to each garment
// Normal and Charged Attack, from Ascension 4
// https://github.com/genshinsim/gcsim/blob/main/internal/characters/kokomi/asc.go
const ASCENSION_4 = 4;
const SONG_OF_PEARLS_HEALING_BONUS_SHARE = 0.15;
// Flawless Strategy, Kokomi's passive she holds from the start, as its text gives it: 25% Healing Bonus, and a CRIT Rate
// Decreased by 100%
const FLAWLESS_STRATEGY_HEALING_BONUS = 0.25;
const FLAWLESS_STRATEGY_CRITICAL_RATE = -1;

// Constellation 4's energy, given to the striker by each garment normal attack that hits, once every 0.2 seconds
const giveGarmentNormalAttackEnergy = ({ kitEffectState, party }: KitContext, { combatant }: KitStrike): void => {
  if (combatant.constellationCount < 4) return;
  if (
    !startKitCooldown(
      kitEffectState,
      combatant.characterId,
      CONSTELLATION_4_ENERGY_STATUS_ID,
      CONSTELLATION_4_ENERGY_SECONDS,
    )
  )
    return;
  gainPartyMemberEnergy(party, combatant, CONSTELLATION_4_ENERGY);
};

// A garment attack's hit adds its share of her Max HP to its damage, and from Ascension 4 Song of Pearls' share of her
// Healing Bonus of her Max HP as well. Its heal is rolled every time, whether or not she holds a shield, as gcsim's heal
// On each normal and charged attack is
const createGarmentAttackHit = (maxHealthShare: number): KitHitBehaviour => {
  const addMaxHealthShare = createMaxHealthScaledBonus(maxHealthShare);
  return {
    additiveBaseDamageBonus: (striker) =>
      addMaxHealthShare(striker) +
      (striker.ascension < ASCENSION_4
        ? 0
        : SONG_OF_PEARLS_HEALING_BONUS_SHARE *
          striker.attributes.attributeTotalMap[Attribute.HealingBonus] *
          striker.attributes.maxHealth),
    healPartyChance: () => 1,
  };
};

// Flawless Strategy's Healing Bonus and CRIT Rate, which she holds from the start
const getPassiveBonuses = (): { amount: number; attribute: Attribute }[] => [
  { amount: FLAWLESS_STRATEGY_HEALING_BONUS, attribute: Attribute.HealingBonus },
  { amount: FLAWLESS_STRATEGY_CRITICAL_RATE, attribute: Attribute.CriticalRate },
];

// Tamakushi Casket, Kokomi's Ascension 1 passive, as its text gives it: Nereid's Ascension refreshes Bake-Kurage on the field to
// Its full duration. gcsim's kokomi/asc.go sets it to 12 seconds and a frame instead, which this does not copy
const refreshBakeKurage = (effects: KitEffect[], characterId: number): void => {
  for (const effect of effects)
    if (
      (effect.kind === "field" || effect.kind === "summon") &&
      (effect.kind === "summon" ? effect.combatant.characterId : effect.characterId) === characterId
    )
      effect.secondsRemaining = SKILL_DURATION_SECONDS;
};

export const KOKOMI_CHARACTER_ID = 10_000_054;

// Kokomi's behaviour: Bake-Kurage casts its ripples and its heal where she stands. Nereid's Ascension robes her in the
// Ceremonial Garment, a stance of her own that replaces her normal attacks, charged attack and Bake-Kurage while it
// Lasts, each of whose attacks adds a share of her Max HP to its damage, and whose normal and charged attacks heal the
// Party. Her passives are built: Flawless Strategy, Tamakushi Casket and Song of Pearls, which adds to the garment's
// Attacks from Ascension 4
// Constellation 1 needs the effect the garment's final combo attack unleashes, which the kit does not build
// Constellation 2 needs her healing bonus to characters at low HP, which her heals do not read
// Constellation 4's energy is built, from each garment normal attack that hits, on a 0.2-second cooldown
// Constellation 6 needs the Hydro DMG Bonus her heals grant for a short time, which the kit does not build
export const createKokomiKitBehaviour = ({
  kit,
  readHits,
  readParameter,
  readSeconds,
  readStance,
}: KitRecordReader): KitBehaviour => {
  const bakeKurageFirstTickSeconds = readSeconds("skillFirstTick");
  const bakeKurageTickIntervalSeconds = readSeconds("skillTickInterval");
  const bakeKurageHealShare = readParameter("bakeKurageHealMaxHealthShare");
  const bakeKurageFlatHeal = readParameter("bakeKurageFlatHeal");
  const bakeKurageRipples = readHits("bakeKurageRipples");
  // In the garment, Bake-Kurage's ripples add a share of her Max HP to their damage as well
  const garmentBakeKurageRipples = readHits("bakeKurageRipples", {
    additiveBaseDamageBonus: createMaxHealthScaledBonus(readParameter("garmentSkillMaxHealthBonus")),
  });
  // Bake-Kurage is a summon of its ripples where Kokomi casts it, and a field of its heal over the circle they reach,
  // Which heals the active character from the cast's Max HP while it stands in the circle
  const createBakeKurage = (ripples: KitHit[]): KitActionBehaviour => ({
    onStart: ({ activeCombatant: combatant, body, kitEffectState }) => {
      const { maxHealth } = combatant.attributes;
      castKitSummon(kitEffectState, body, combatant, ripples, { secondsRemaining: SKILL_DURATION_SECONDS });
      const centre = createAheadBody(body, SKILL_CENTRE_METRES).position;
      castKitField(kitEffectState, combatant.characterId, centre, {
        nextTickSeconds: bakeKurageFirstTickSeconds,
        onTick: (tick) =>
          changeKitMemberHealth(
            tick,
            combatant,
            tick.activeCombatant.characterId,
            bakeKurageHealShare * maxHealth + bakeKurageFlatHeal,
          ),
        radius: SKILL_RADIUS,
        secondsRemaining: SKILL_DURATION_SECONDS,
        tickIntervalSeconds: bakeKurageTickIntervalSeconds,
      });
    },
  });
  const garmentNormalAttack = {
    hits: [
      {
        ...createGarmentAttackHit(readParameter("garmentNormalAttackMaxHealthBonus")),
        onStrike: giveGarmentNormalAttackEnergy,
      },
    ],
  };
  // The garment's normal attacks are Normal Attack DMG and its charged attack Charged Attack DMG, gcsim's AttackTagNormal
  // In kokomi/attack.go and AttackTagExtra in kokomi/charge.go; its Bake-Kurage is Elemental Skill DMG in skill.go
  const ceremonialGarment = readStance("ceremonialGarment", {
    chargedAttack: { hits: [createGarmentAttackHit(readParameter("garmentChargedAttackMaxHealthBonus"))] },
    normalAttacks: kit.normalAttacks.map(() => garmentNormalAttack),
    skill: createBakeKurage(garmentBakeKurageRipples),
  });
  return {
    // Nereid's Ascension robes Kokomi in the garment as it is cast, and from Ascension 1 refreshes her Bake-Kurage
    burst: {
      onStart: ({ activeCombatant: combatant, kitEffectState }) => {
        if (combatant.ascension >= ASCENSION_1) refreshBakeKurage(kitEffectState.effects, combatant.characterId);
        enterKitStance(kitEffectState, combatant, ceremonialGarment, GARMENT_SECONDS, { isEndedOnSwap: true });
      },
    },
    // Constellation 4, The Moon Overlooks the Waters: her Normal Attack SPD is raised while she dons the garment
    getNormalAttackSpeedBonus: ({ activeCombatant, kitEffectState }) =>
      activeCombatant.constellationCount >= 4 && findKitStance(kitEffectState.effects, activeCombatant.characterId)
        ? 0.1
        : 0,
    getPassiveBonuses,
    skill: createBakeKurage(bakeKurageRipples),
  };
};
