import type { KitActionBehaviour } from "#src/models/kit/KitActionBehaviour";
import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitHit } from "#src/models/kit/KitHit";
import type { KitHitBehaviour } from "#src/models/kit/KitHitBehaviour";
import type { KitRecordReader } from "#src/models/kit/KitRecordReader";

import { createAheadBody } from "#src/services/kit/createAheadBody";
import { createMaxHealthScaledBonus } from "#src/services/kit/createMaxHealthScaledBonus";
import { castKitField } from "#src/services/kit/effects/castKitField";
import { castKitSummon } from "#src/services/kit/effects/castKitSummon";
import { changeKitMemberHealth } from "#src/services/kit/effects/changeKitMemberHealth";
import { enterKitStance } from "#src/services/kit/effects/enterKitStance";
import { findKitStance } from "#src/services/kit/effects/findKitStance";

// Measured: gcsim (MIT) kokomi/skill.go, Bake-Kurage's heal lands on the active character while it stands within a circle
// Of radius 6 whose centre lies 3 metres ahead, every tick, for 12.5 seconds
// Https://github.com/genshinsim/gcsim/blob/main/internal/characters/kokomi/skill.go
const SKILL_DURATION_SECONDS = 12.5;
const SKILL_CENTRE_METRES = 3;
const SKILL_RADIUS = 6;
// Measured: gcsim (MIT) kokomi/burst.go, Ceremonial Garment lasts ten seconds
// Https://github.com/genshinsim/gcsim/blob/main/internal/characters/kokomi/burst.go
const GARMENT_SECONDS = 10;

// A garment attack's hit adds its share of her Max HP to its damage, and its heal is rolled every time, whether or not
// She holds a shield, as gcsim's heal on each normal and charged attack is
const createGarmentAttackHit = (maxHealthShare: number): KitHitBehaviour => ({
  additiveBaseDamageBonus: createMaxHealthScaledBonus(maxHealthShare),
  healPartyChance: () => 1,
});

export const KOKOMI_CHARACTER_ID = 10_000_054;

// Kokomi's behaviour: Bake-Kurage casts its ripples and its heal where she stands. Nereid's Ascension robes her in the
// Ceremonial Garment, a stance of her own that replaces her normal attacks, charged attack and Bake-Kurage while it
// Lasts, each of whose attacks adds a share of her Max HP to its damage, and whose normal and charged attacks heal the
// Party
// Constellation 1 needs the effect the garment's final combo attack unleashes, which the kit does not build
// Constellation 2 needs her healing bonus to characters at low HP, which her heals do not read
// Constellation 4's energy needs the energy each landed attack in the garment gives, on a short cooldown, not built
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
  const garmentNormalAttack = { hits: [createGarmentAttackHit(readParameter("garmentNormalAttackMaxHealthBonus"))] };
  // The garment's normal attacks are Normal Attack DMG and its charged attack Charged Attack DMG, gcsim's AttackTagNormal
  // In kokomi/attack.go and AttackTagExtra in kokomi/charge.go; its Bake-Kurage is Elemental Skill DMG in skill.go
  const ceremonialGarment = readStance("ceremonialGarment", {
    chargedAttack: { hits: [createGarmentAttackHit(readParameter("garmentChargedAttackMaxHealthBonus"))] },
    normalAttacks: kit.normalAttacks.map(() => garmentNormalAttack),
    skill: createBakeKurage(garmentBakeKurageRipples),
  });
  return {
    // Nereid's Ascension robes Kokomi in the garment as it is cast
    burst: {
      onStart: ({ activeCombatant: combatant, kitEffectState }) =>
        enterKitStance(kitEffectState, combatant, ceremonialGarment, GARMENT_SECONDS, { isEndedOnSwap: true }),
    },
    // Constellation 4, The Moon Overlooks the Waters: her Normal Attack SPD is raised while she dons the garment
    getNormalAttackSpeedBonus: ({ activeCombatant, kitEffectState }) =>
      activeCombatant.constellationCount >= 4 && findKitStance(kitEffectState.effects, activeCombatant.characterId)
        ? 0.1
        : 0,
    skill: createBakeKurage(bakeKurageRipples),
  };
};
