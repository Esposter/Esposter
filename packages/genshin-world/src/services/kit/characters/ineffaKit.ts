import type { Combatant } from "#src/models/kit/Combatant";
import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitBody } from "#src/models/kit/KitBody";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitHit } from "#src/models/kit/KitHit";
import type { KitRecordReader } from "#src/models/kit/KitRecordReader";

import { LunarReactionType } from "#src/models/combat/LunarReactionType";
import { Element } from "#src/models/Element";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { castKitShield } from "#src/services/kit/effects/castKitShield";
import { castKitSummon } from "#src/services/kit/effects/castKitSummon";
import { scheduleKitTask } from "#src/services/kit/effects/scheduleKitTask";
import { startKitCooldown } from "#src/services/kit/effects/startKitCooldown";
import { gainPartyMemberEnergy } from "#src/services/party/gainPartyMemberEnergy";
import { takeOne } from "@esposter/shared";

export const INEFFA_CHARACTER_ID = 10_000_116;

const CONSTELLATION_4 = 4;
const CONSTELLATION_4_COOLDOWN_ID = "ineffa-constellation-4-cooldown";
const CONSTELLATION_4_ENERGY = 5;
const CONSTELLATION_4_SECONDS = 4;

// Birgitta discharges ten times while she stands, with no poise, as gcsim (MIT, main) ineffa/skill.go gives her. Her
// Electro Particles, which gcsim gives on an internal cooldown, wait on the particle hook
// https://github.com/genshinsim/gcsim/blob/main/internal/characters/ineffa/skill.go
const BIRGITTA_DISCHARGE_COUNT = 10;
const BIRGITTA_ID = "birgitta";

// Measured: gcsim (MIT, main) ineffa/asc.go, her Moonsign Benediction turns the party's Electro-Charged into
// Lunar-Charged and adds 0.7% Base DMG Bonus to its Lunar-Charged for each 100 of her ATK, at most 14%
// https://github.com/genshinsim/gcsim/blob/main/internal/characters/ineffa/asc.go
const BENEDICTION_BASE_DAMAGE_BONUS_PER_ATTACK = 0.007 / 100;
const BENEDICTION_MAXIMUM_BASE_DAMAGE_BONUS = 0.14;

// Ineffa's behaviour: Cleaning Mode places its shield by a task and summons Birgitta after its hit, and Cyclonic
// Exterminator summons her again at its hit, ending the one on the field. Her Moonsign Benediction adds its Base DMG
// Bonus by her ATK. Her Constellation 4 energy is built, from any Lunar-Charged reaction of her party, once every 4
// Seconds, as gcsim (MIT, main) ineffa/cons.go gives it
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
      onStart: ({ activeCombatant: combatant, body, kitEffectState }) =>
        summonBirgitta(kitEffectState, body, combatant, burstBirgittaSpawnSeconds, burstBirgittaDischarges),
    },
    // The Edictless Path, from Constellation 4: a Lunar-Charged reaction of the party restores 5 energy to Ineffa, once
    // Every 4 seconds
    onKitEvent: (event, { kitEffectState, party }, combatant) => {
      if (
        event.kind !== KitEventKind.ReactionTriggered ||
        combatant.constellationCount < CONSTELLATION_4 ||
        !event.reactions.some(({ reactionType }) => reactionType === LunarReactionType.LunarCharged)
      )
        return;
      if (startKitCooldown(kitEffectState, combatant.characterId, CONSTELLATION_4_COOLDOWN_ID, CONSTELLATION_4_SECONDS))
        gainPartyMemberEnergy(party, combatant, CONSTELLATION_4_ENERGY);
    },
    moonsignBenediction: {
      getBaseDamageBonus: ({ attributes }) =>
        Math.min(attributes.attack * BENEDICTION_BASE_DAMAGE_BONUS_PER_ATTACK, BENEDICTION_MAXIMUM_BASE_DAMAGE_BONUS),
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
