import type { EnemyStatus } from "#src/models/enemy/EnemyStatus";
import type { Combatant } from "#src/models/kit/Combatant";
import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitBuff } from "#src/models/kit/KitBuff";
import type { KitEffect } from "#src/models/kit/KitEffect";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitRecordReader } from "#src/models/kit/KitRecordReader";
import type { GroundPoint } from "genshin-engine";

import { Attribute } from "#src/models/character/Attribute";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { FIXED_STEP_SECONDS } from "#src/services/constants";
import { buffKitMember } from "#src/services/kit/effects/buffKitMember";
import { castKitField } from "#src/services/kit/effects/castKitField";
import { castKitSummon } from "#src/services/kit/effects/castKitSummon";
import { removeKitEffects } from "#src/services/kit/effects/removeKitEffects";
import { scheduleKitTask } from "#src/services/kit/effects/scheduleKitTask";
import { getPartyMember } from "#src/services/party/getPartyMember";
import { takeOne } from "@esposter/shared";

// The wiki's Claw and Thunder holds up to three Electro Sigils at once, a new one restarting their seconds
const ELECTRO_SIGIL_MAX_COUNT = 3;
const ELECTRO_SIGIL_SOURCE = "Electro Sigil";
const LIGHTNING_FANG_SOURCE = "Lightning Fang";
const WOLFS_INSTINCT_CONSTELLATION = 1;
const WOLFS_INSTINCT_DAMAGE_BONUS = 0.1;
const WOLFS_INSTINCT_SECONDS = 8;
const WOLFS_INSTINCT_SOURCE = "Wolf's Instinct";
const WOLF_WITHIN_ID = "razor-wolf-within";
// Awakening, from Ascension 1, cuts Claw and Thunder's cooldown by 18% and resets it as Lightning Fang hits, as the wiki's
// Passive page and gcsim v2.47.2 (MIT) razor/asc.go give it
// https://genshin-impact.fandom.com/wiki/Awakening
const AWAKENING_ASCENSION = 1;
const AWAKENING_COOLDOWN_MULTIPLIER = 0.82;
// Lupus Fulguris, from six constellations, charges Razor's claymore every 10 seconds, and the next strike's hit releases
// Lightning, as gcsim v2.47.2 (MIT) razor/cons.go gives it
// https://genshin-impact.fandom.com/wiki/Lupus_Fulguris
const LUPUS_FULGURIS_CONSTELLATION = 6;
const LUPUS_FULGURIS_RECHARGE_SECONDS = 10;

// Whether an effect is a buff on Razor from one of his own sources: his Electro Sigils, whose Energy Recharge holds each
// Sigil's share of it, or the Wolf Within's Electro RES, which marks Lightning Fang standing
const checkIsRazorBuff = (effect: KitEffect, characterId: number, source: string): effect is KitBuff =>
  effect.kind === "buff" && effect.characterId === characterId && effect.source === source;

export const RAZOR_CHARACTER_ID = 10_000_020;

const CONSTELLATION_2 = 2;
const CONSTELLATION_2_CRIT_RATE_BONUS = 0.1;
const CONSTELLATION_2_HEALTH_SHARE = 0.3;
// Constellation 4, Bite: each enemy Claw and Thunder's press strikes takes 15% less DEF for 7 seconds, as gcsim v2.47.2 (MIT)
// Gives it on the press's attacks, and the hold gives none
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/razor/cons.go
const CONSTELLATION_4 = 4;
const BITE_DEFENSE_REDUCTION = 0.15;
const BITE_SECONDS = 7;
const BITE_STATUS: EnemyStatus = {
  damageTakenBonus: 0,
  defenseReduction: BITE_DEFENSE_REDUCTION,
  id: "razor-constellation-4",
  secondsRemaining: BITE_SECONDS,
};
const getBiteStatus = ({ constellationCount }: Combatant): EnemyStatus | undefined =>
  constellationCount >= CONSTELLATION_4 ? BITE_STATUS : undefined;

// Razor's behaviour: Claw and Thunder's press gives him an Electro Sigil, up to three, and its hold clears them into
// Energy at its hit. Lightning Fang clears them too and casts the Wolf Within, which stands while he stays on the field,
// Resets the skill's cooldown from Ascension 1 and casts a strike's Soul Companion beside it. Awakening cuts the skill's
// Cooldown from Ascension 1, and from six constellations a strike while his claymore is charged releases Lupus
// Fulguris's lightning
export const createRazorKitBehaviour = ({
  kit,
  readHits,
  readParameter,
  readSeconds,
}: KitRecordReader): KitBehaviour => {
  const sigilEnergyRecharge = readParameter("sigilEnergyRecharge");
  const sigilEnergy = readParameter("sigilEnergy");
  const sigilSeconds = readParameter("sigilSeconds");
  const electroResistanceBonus = readParameter("electroResistanceBonus");
  const wolfWithinSeconds = readParameter("wolfWithinSeconds");
  const lightningFangSigilClearSeconds = readSeconds("lightningFangSigilClear");
  const lightningFangHitmarkSeconds = takeOne(kit.elementalBurst.hits).hitmarkSeconds;
  const holdHitmarkSeconds = takeOne(takeOne(kit.elementalSkillHolds ?? []).action.hits).hitmarkSeconds;
  const soulCompanionHits = readHits("soulCompanion");
  const lupusFulgurisHits = readHits("lupusFulguris");
  // The Electro Sigils Razor holds, read off the Energy Recharge they give him
  const getElectroSigilCount = (characterId: number, effects: readonly KitEffect[]): number => {
    const sigilBuff = effects.find((effect) => checkIsRazorBuff(effect, characterId, ELECTRO_SIGIL_SOURCE));
    return sigilBuff === undefined ? 0 : Math.round(sigilBuff.amount / sigilEnergyRecharge);
  };
  // Gives Razor an Electro Sigil, up to three, restarting the seconds of those he holds
  const addElectroSigil = (characterId: number, kitEffectState: KitEffectState): void =>
    buffKitMember(kitEffectState, characterId, {
      amount:
        sigilEnergyRecharge *
        Math.min(ELECTRO_SIGIL_MAX_COUNT, getElectroSigilCount(characterId, kitEffectState.effects) + 1),
      attribute: Attribute.EnergyRecharge,
      secondsRemaining: sigilSeconds,
      source: ELECTRO_SIGIL_SOURCE,
    });
  // Clears Razor's Electro Sigils at a hitmark, each giving him its energy up to what his burst costs, on the step the
  // Hitmark falls in
  const scheduleElectroSigilClear = (kitEffectState: KitEffectState, owner: Combatant, hitmarkSeconds: number): void =>
    scheduleKitTask(kitEffectState, owner.characterId, hitmarkSeconds, ({ kitEffectState: tickEffectState, party }) => {
      const sigilCount = getElectroSigilCount(owner.characterId, tickEffectState.effects);
      if (sigilCount === 0) return;
      const partyMember = getPartyMember(party, owner.characterId);
      partyMember.energy = Math.min(owner.kit.burstEnergyCost, partyMember.energy + sigilEnergy * sigilCount);
      removeKitEffects(tickEffectState, (effect) => checkIsRazorBuff(effect, owner.characterId, ELECTRO_SIGIL_SOURCE));
    });
  // Lightning Fang's Wolf Within, cast from the burst's hit for its seconds while Razor stays on the field. Its first
  // Tick, at the hit, resets his skill's cooldown from Ascension 1 and gives him the Electro RES bonus that marks it
  // Standing, and leaving the field ends both through the swap's kit event
  const castWolfWithin = (kitEffectState: KitEffectState, owner: Combatant, centre: GroundPoint): void => {
    castKitField(kitEffectState, owner.characterId, centre, {
      id: WOLF_WITHIN_ID,
      nextTickSeconds: lightningFangHitmarkSeconds,
      onTick: ({ kitEffectState: tickKitEffectState, party }, tickIndex) => {
        if (tickIndex > 0) return;
        if (owner.ascension >= AWAKENING_ASCENSION) getPartyMember(party, owner.characterId).skillCooldownSeconds = 0;
        buffKitMember(tickKitEffectState, owner.characterId, {
          amount: electroResistanceBonus,
          attribute: Attribute.ElectroResistance,
          secondsRemaining: wolfWithinSeconds,
          source: LIGHTNING_FANG_SOURCE,
        });
      },
      secondsRemaining: lightningFangHitmarkSeconds + wolfWithinSeconds,
      tickIntervalSeconds: FIXED_STEP_SECONDS,
    });
  };
  // Whether Razor's claymore is still charging since its last lightning, whose summon stands for the recharge
  const checkIsLupusFulgurisCharging = (characterId: number, effects: readonly KitEffect[]): boolean =>
    effects.some(
      (effect) =>
        effect.kind === "summon" &&
        effect.combatant.characterId === characterId &&
        effect.hits.some((hit) => lupusFulgurisHits.includes(hit)),
    );
  return {
    // Suppression, from Constellation 2: his strikes crit 10% more often against an enemy below 30% HP
    getStrikeCriticalRateBonus: ({ combatant }, enemy) =>
      combatant.constellationCount >= CONSTELLATION_2 && enemy.health / enemy.maxHealth < CONSTELLATION_2_HEALTH_SHARE
        ? CONSTELLATION_2_CRIT_RATE_BONUS
        : 0,
    // Its sigils are cleared into energy after the burst's cost is spent, and the Wolf Within stands from its hit
    burst: {
      onStart: ({ activeCombatant: combatant, body: { position }, kitEffectState }) => {
        scheduleElectroSigilClear(kitEffectState, combatant, lightningFangSigilClearSeconds);
        castWolfWithin(kitEffectState, combatant, { x: position.x, z: position.z });
      },
    },
    getSkillCooldownMultiplier: ({ activeCombatant: combatant }) =>
      combatant.ascension >= AWAKENING_ASCENSION ? AWAKENING_COOLDOWN_MULTIPLIER : 1,
    // While Lightning Fang stands, a strike casts its Soul Companion. From six constellations, a strike while his
    // Claymore is charged casts Lupus Fulguris's lightning, whose summon stands until 10 seconds past the strike's hit,
    // And gives him an Electro Sigil outside Lightning Fang
    normalAttacks: kit.normalAttacks.map((strike, index) => {
      const soulCompanionHit = takeOne(soulCompanionHits, index);
      const lupusFulgurisHit = takeOne(lupusFulgurisHits, index);
      const lupusFulgurisSeconds = takeOne(strike.hits).hitmarkSeconds + LUPUS_FULGURIS_RECHARGE_SECONDS;
      return {
        onStart: ({ activeCombatant: combatant, body, kitEffectState }) => {
          const isLightningFangLive = kitEffectState.effects.some((effect) =>
            checkIsRazorBuff(effect, combatant.characterId, LIGHTNING_FANG_SOURCE),
          );
          if (isLightningFangLive) castKitSummon(kitEffectState, body, combatant, [soulCompanionHit]);
          if (
            combatant.constellationCount < LUPUS_FULGURIS_CONSTELLATION ||
            checkIsLupusFulgurisCharging(combatant.characterId, kitEffectState.effects)
          )
            return;
          castKitSummon(kitEffectState, body, combatant, [lupusFulgurisHit], {
            secondsRemaining: lupusFulgurisSeconds,
          });
          if (!isLightningFangLive) addElectroSigil(combatant.characterId, kitEffectState);
        },
      };
    }),
    // Leaving the field ends the Wolf Within and the Electro RES bonus it gives, as gcsim's swap does
    onKitEvent: (event, { activeCombatant, kitEffectState }, combatant) => {
      // Wolf's Instinct, from Constellation 1: a particle or orb collected while he is on the field raises his all-DMG bonus
      // For 8 seconds, as gcsim v2.47.2 (MIT) razor/cons.go gives it, which ignores a pickup with another on the field
      if (
        event.kind === KitEventKind.EnergyParticleCollected &&
        combatant.constellationCount >= WOLFS_INSTINCT_CONSTELLATION &&
        activeCombatant.characterId === combatant.characterId
      )
        buffKitMember(kitEffectState, combatant.characterId, {
          amount: WOLFS_INSTINCT_DAMAGE_BONUS,
          attribute: Attribute.AllDamageBonus,
          secondsRemaining: WOLFS_INSTINCT_SECONDS,
          source: WOLFS_INSTINCT_SOURCE,
        });
      if (event.kind !== KitEventKind.CharacterSwapped || event.previousCharacterId !== combatant.characterId) return;
      removeKitEffects(
        kitEffectState,
        (effect) =>
          (effect.kind === "field" && effect.id === WOLF_WITHIN_ID && effect.characterId === combatant.characterId) ||
          checkIsRazorBuff(effect, combatant.characterId, LIGHTNING_FANG_SOURCE),
      );
    },
    // The press gains its Electro Sigil as it starts, and each enemy it strikes takes Bite's DEF cut from Constellation 4
    skill: {
      hits: [{ enemyStatus: getBiteStatus }],
      onStart: ({ activeCombatant: combatant, kitEffectState }) =>
        addElectroSigil(combatant.characterId, kitEffectState),
    },
    // The hold clears the sigils into energy at its hit
    skillHolds: [
      {
        onStart: ({ activeCombatant: combatant, kitEffectState }) =>
          scheduleElectroSigilClear(kitEffectState, combatant, holdHitmarkSeconds),
      },
    ],
  };
};
