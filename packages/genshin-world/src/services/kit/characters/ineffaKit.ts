import type { Combatant } from "#src/models/kit/Combatant";
import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitBody } from "#src/models/kit/KitBody";
import type { KitBuff } from "#src/models/kit/KitBuff";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitEvent } from "#src/models/kit/KitEvent";
import type { KitHit } from "#src/models/kit/KitHit";
import type { KitRecordReader } from "#src/models/kit/KitRecordReader";

import { Attribute } from "#src/models/character/Attribute";
import { LunarReactionType } from "#src/models/combat/LunarReactionType";
import { Element } from "#src/models/Element";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { EnergyDropKind } from "#src/models/shared/EnergyDropKind";
import { collectKitEnergyDrops } from "#src/services/kit/collectKitEnergyDrops";
import { buffKitMember } from "#src/services/kit/effects/buffKitMember";
import { castKitShield } from "#src/services/kit/effects/castKitShield";
import { castKitSummon } from "#src/services/kit/effects/castKitSummon";
import { delayKitEnergy } from "#src/services/kit/effects/delayKitEnergy";
import { removeKitEffects } from "#src/services/kit/effects/removeKitEffects";
import { scheduleKitTask } from "#src/services/kit/effects/scheduleKitTask";
import { startKitCooldown } from "#src/services/kit/effects/startKitCooldown";
import { gainPartyMemberEnergy } from "#src/services/party/gainPartyMemberEnergy";
import { toKitSeconds } from "#src/services/kit/toKitSeconds";
import { takeOne } from "@esposter/shared";

export const INEFFA_CHARACTER_ID = 10_000_116;

const CONSTELLATION_4 = 4;
const CONSTELLATION_4_COOLDOWN_ID = "ineffa-constellation-4-cooldown";
const CONSTELLATION_4_ENERGY = 5;
const CONSTELLATION_4_SECONDS = 4;

// Birgitta discharges ten times while she stands, with no poise, as gcsim (MIT, main) ineffa/skill.go gives her. Each
// Discharge that lands gives an Electro particle two times in three, which lands 100 frames later as gcsim's particle
// Callback gives it
// https://github.com/genshinsim/gcsim/blob/main/internal/characters/ineffa/skill.go
const BIRGITTA_DISCHARGE_COUNT = 10;
const BIRGITTA_ID = "birgitta";

// A Birgitta discharge that lands drops an Electro particle two times in three, as gcsim's baseParticleCB gives it
// (skill.go lines 87-98). The particle lands 100 frames later, the default ParticleDelay (character.go line 144). Its
// 18-frame internal cooldown cannot bind, as one chain's discharges come 119 frames apart, so it is not kept
const BIRGITTA_PARTICLE_CHANCE = 0.66;
const BIRGITTA_PARTICLE_DELAY_ID = "ineffa-particle-delay";
const BIRGITTA_PARTICLE_DELAY_SECONDS = toKitSeconds(100);

// Measured: gcsim (MIT, main) ineffa/asc.go, her Moonsign Benediction turns the party's Electro-Charged into
// Lunar-Charged and adds 0.7% Base DMG Bonus to its Lunar-Charged for each 100 of her ATK, at most 14%
// https://github.com/genshinsim/gcsim/blob/main/internal/characters/ineffa/asc.go
const BENEDICTION_BASE_DAMAGE_BONUS_PER_ATTACK = 0.007 / 100;
const BENEDICTION_MAXIMUM_BASE_DAMAGE_BONUS = 0.14;

// Panoramic Permutation Protocol, Ineffa's Ascension 4 passive: Supreme Instruction: Cyclonic Exterminator gives Ineffa and
// The active party member Elemental Mastery of 6% of her ATK for 20 seconds, as gcsim (MIT, main) ineffa/asc.go gives it.
// The amount is priced from her ATK as the burst is cast, and the buff moves to whoever comes on the field
// https://github.com/genshinsim/gcsim/blob/main/internal/characters/ineffa/asc.go
const ASCENSION_4 = 4;
const PERMUTATION_ELEMENTAL_MASTERY_SHARE = 0.06;
const PERMUTATION_SECONDS = 20;
const PERMUTATION_SOURCE = "ineffa-permutation";

// Moves the Parameter Permutation buff off the member who left the field and onto the one who came on, for the seconds
// It has left. Ineffa keeps her own, which is what the buff is kept on while she is in the party
const movePermutation = (event: KitEvent, kitEffectState: KitEffectState, combatant: Combatant): void => {
  if (event.kind !== KitEventKind.CharacterSwapped) return;
  const permutation = kitEffectState.effects.find(
    (effect): effect is KitBuff =>
      effect.kind === "buff" && effect.characterId === combatant.characterId && effect.source === PERMUTATION_SOURCE,
  );
  if (!permutation) return;
  if (event.previousCharacterId !== combatant.characterId)
    removeKitEffects(
      kitEffectState,
      (effect) =>
        effect.kind === "buff" &&
        effect.source === PERMUTATION_SOURCE &&
        effect.characterId === event.previousCharacterId,
    );
  if (event.characterId !== combatant.characterId)
    buffKitMember(kitEffectState, event.characterId, {
      amount: permutation.amount,
      attribute: Attribute.ElementalMastery,
      secondsRemaining: permutation.secondsRemaining,
      source: PERMUTATION_SOURCE,
    });
};

// Ineffa's behaviour: Cleaning Mode places its shield by a task and summons Birgitta after its hit, and Cyclonic
// Exterminator summons her again at its hit, ending the one on the field. Her Moonsign Benediction adds its Base DMG
// Bonus by her ATK, and from Ascension 4 her burst gives her and the active member Elemental Mastery by her ATK.
// Her Constellation 4 energy is built, from any Lunar-Charged reaction of her party once every 4 seconds, as gcsim
// (MIT, main) ineffa/cons.go gives it
// Constellation 1 needs the Carrier Flow Composite team status and its Lunar-Charged DMG bonus, not built
// Constellation 2 needs the Punishment Edict status on a hit opponent and its delayed effect, not built
// Constellation 6 needs the Carrier Flow Composite status and the thunderclouds' bursts, not built
export const createIneffaKitBehaviour = ({
  kit,
  readArea,
  readParameter,
  readSeconds,
}: KitRecordReader): KitBehaviour => {
  const shieldAttackShare = readParameter("shieldAttackShare");
  const shieldFlatHealth = readParameter("shieldFlatHealth");
  const shieldSeconds = readParameter("shieldSeconds");
  const shieldStartSeconds = readSeconds("skillShield");
  const birgittaSeconds = readSeconds("birgitta");
  const skillBirgittaSpawnSeconds = readSeconds("skillBirgittaSpawn");
  const burstBirgittaSpawnSeconds = takeOne(kit.elementalBurst.hits).hitmarkSeconds;
  const birgittaFirstDischargeSeconds = readSeconds("birgittaFirstDischarge");
  const birgittaDischargeIntervalSeconds = readSeconds("birgittaDischargeInterval");
  const birgittaHitArea = readArea("birgitta");
  const birgittaTalentMultiplier = readParameter("birgittaDischargeMultiplier");
  // Birgitta is cast at the start of the action and appears on the field at her spawn. Her discharges count from her
  // Cast, each landing on the schedule gcsim gives her after her spawn
  const createBirgittaDischarges = (spawnSeconds: number): KitHit[] =>
    Array.from({ length: BIRGITTA_DISCHARGE_COUNT }, (_value, index) => ({
      hitArea: birgittaHitArea,
      hitmarkSeconds: spawnSeconds + birgittaFirstDischargeSeconds + birgittaDischargeIntervalSeconds * index,
      // A landed discharge delays a particle, whose amount is the count the delay holds, one each
      onStrike: ({ kitEffectState, random }, strike) => {
        if (random() < BIRGITTA_PARTICLE_CHANCE)
          delayKitEnergy(kitEffectState, strike.combatant.characterId, {
            energy: 1,
            id: BIRGITTA_PARTICLE_DELAY_ID,
            seconds: BIRGITTA_PARTICLE_DELAY_SECONDS,
          });
      },
      poiseDamage: 0,
      talentMultiplier: birgittaTalentMultiplier,
    }));
  const skillBirgittaDischarges = createBirgittaDischarges(skillBirgittaSpawnSeconds);
  const burstBirgittaDischarges = createBirgittaDischarges(burstBirgittaSpawnSeconds);
  // Recasting Birgitta ends the one on the field, as gcsim starts a new discharge chain and cancels the old one's
  const summonBirgitta = (
    kitEffectState: KitEffectState,
    body: KitBody,
    combatant: Combatant,
    spawnSeconds: number,
    discharges: KitHit[],
  ): void => {
    for (const effect of kitEffectState.effects)
      if (effect.kind === "summon" && effect.id === BIRGITTA_ID) effect.secondsRemaining = 0;
    castKitSummon(kitEffectState, body, combatant, discharges, {
      id: BIRGITTA_ID,
      secondsRemaining: spawnSeconds + birgittaSeconds,
      spawnSeconds,
    });
  };
  return {
    burst: {
      onStart: ({ activeCombatant: combatant, body, kitEffectState }) => {
        summonBirgitta(kitEffectState, body, combatant, burstBirgittaSpawnSeconds, burstBirgittaDischarges);
        if (combatant.ascension >= ASCENSION_4)
          buffKitMember(kitEffectState, combatant.characterId, {
            amount: PERMUTATION_ELEMENTAL_MASTERY_SHARE * combatant.attributes.attack,
            attribute: Attribute.ElementalMastery,
            secondsRemaining: PERMUTATION_SECONDS,
            source: PERMUTATION_SOURCE,
          });
      },
    },
    moonsignBenediction: {
      getBaseDamageBonus: ({ attributes }) =>
        Math.min(attributes.attack * BENEDICTION_BASE_DAMAGE_BONUS_PER_ATTACK, BENEDICTION_MAXIMUM_BASE_DAMAGE_BONUS),
    },
    // The Edictless Path, from Constellation 4: a Lunar-Charged reaction of the party restores 5 energy to Ineffa, once
    // Every 4 seconds
    onKitEvent: (event, context, combatant) => {
      const { kitEffectState, party } = context;
      movePermutation(event, kitEffectState, combatant);
      // Birgitta's particle lands as its delay runs out, of Electro, distributed by the party's energy as a drop is
      if (
        event.kind === KitEventKind.EffectExpired &&
        event.effect.kind === "status" &&
        event.effect.characterId === combatant.characterId &&
        event.effect.id === BIRGITTA_PARTICLE_DELAY_ID
      )
        collectKitEnergyDrops(
          [{ count: event.effect.stacks ?? 0, element: Element.Electro, energyDropKind: EnergyDropKind.Particle }],
          undefined,
          context,
        );
      if (
        event.kind !== KitEventKind.ReactionTriggered ||
        combatant.constellationCount < CONSTELLATION_4 ||
        !event.reactions.some(({ reactionType }) => reactionType === LunarReactionType.LunarCharged)
      )
        return;
      if (startKitCooldown(kitEffectState, combatant.characterId, CONSTELLATION_4_COOLDOWN_ID, CONSTELLATION_4_SECONDS))
        gainPartyMemberEnergy(party, combatant, CONSTELLATION_4_ENERGY);
    },
    skill: {
      // The shield is placed by a task, and reads the caster's ATK as it stands then. Its element is Electro, and it
      // Lasts the seconds gcsim gives it from its placement
      onStart: ({ activeCombatant: combatant, body, kitEffectState }) => {
        scheduleKitTask(kitEffectState, combatant.characterId, shieldStartSeconds, ({ kitEffectState: tickState }) =>
          castKitShield(tickState, combatant.characterId, {
            element: Element.Electro,
            health: shieldAttackShare * combatant.attributes.attack + shieldFlatHealth,
            secondsRemaining: shieldSeconds,
          }),
        );
        summonBirgitta(kitEffectState, body, combatant, skillBirgittaSpawnSeconds, skillBirgittaDischarges);
      },
    },
  };
};
