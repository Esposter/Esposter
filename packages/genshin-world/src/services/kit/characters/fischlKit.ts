import type { Reaction } from "#src/models/combat/Reaction";
import type { Combatant } from "#src/models/kit/Combatant";
import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitBody } from "#src/models/kit/KitBody";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitHit } from "#src/models/kit/KitHit";
import type { KitRecordReader } from "#src/models/kit/KitRecordReader";
import type { KitSummon } from "#src/models/kit/KitSummon";

import { AttackTag } from "#src/models/combat/AttackTag";
import { ReactionType } from "#src/models/combat/ReactionType";
import { Element } from "#src/models/Element";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { ELECTRO_REACTION_TYPES } from "#src/services/kit/constants";
import { createKitBody } from "#src/services/kit/createKitBody";
import { castKitSummon } from "#src/services/kit/effects/castKitSummon";
import { changeKitMemberHealth } from "#src/services/kit/effects/changeKitMemberHealth";
import { findStandingKitSummon } from "#src/services/kit/effects/findStandingKitSummon";
import { getKitMaxHealth } from "#src/services/kit/effects/getKitMaxHealth";
import { scheduleKitTask } from "#src/services/kit/effects/scheduleKitTask";
import { startKitCooldown } from "#src/services/kit/effects/startKitCooldown";

// Undone Be Thy Sinful Hex, from Ascension 4: an Electro-related reaction the character on the field triggers while Oz
// Stands strikes the enemy with Thundering Retribution, as Oz snapshot it, at most once every 0.5 seconds for each
// Character, dealt as Elemental Skill DMG, as gcsim v2.47.2 (MIT) fischl/asc.go's AttackTagElementalArt gives it
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/fischl/asc.go
// https://genshin-impact.fandom.com/wiki/Undone_Be_Thy_Sinful_Hex
const UNDONE_BE_THY_SINFUL_HEX_ASCENSION = 4;
const THUNDERING_RETRIBUTION_COOLDOWN_STATUS_ID = "fischl-thundering-retribution-cooldown";
const THUNDERING_RETRIBUTION_COOLDOWN_SECONDS = 0.5;
// Gaze of the Deep, from one constellation: while Oz is not on the field, each of Fischl's normal attacks fires a
// Coordinated attack along with it. https://genshin-impact.fandom.com/wiki/Gaze_of_the_Deep
const GAZE_OF_THE_DEEP_CONSTELLATION = 1;
// Devourer of All Sins, from two constellations: Oz's summon deals more of Fischl's ATK, over a wider radius
const DEVOURER_OF_ALL_SINS_CONSTELLATION = 2;
// Her Pilgrimage of Bleak, from four constellations: the burst deals an extra hit round her, and heals her by 20% of her
// Max HP a frame after Oz spawns, as gcsim v2.47.2 (MIT) fischl/burst.go gives it
// https://genshin-impact.fandom.com/wiki/Her_Pilgrimage_of_Bleak
const HER_PILGRIMAGE_OF_BLEAK_CONSTELLATION = 4;
const HER_PILGRIMAGE_OF_BLEAK_HEALTH_SHARE = 0.2;
// Evernight Raven, from six constellations: Oz stands longer, and attacks along with every normal attack of the character
// On the field, as Oz snapshot it, as gcsim v2.47.2 (MIT) fischl/cons.go gives it
// https://genshin-impact.fandom.com/wiki/Evernight_Raven
const EVERNIGHT_RAVEN_CONSTELLATION = 6;

const OZ_SUMMON_ID = "fischl-oz";

// Whether a reaction is Electro-related: one that always holds Electro, or a Swirl or Crystallize of Electro
const checkIsElectroReaction = ({ element, reactionType }: Reaction): boolean =>
  ELECTRO_REACTION_TYPES.has(reactionType) ||
  ((reactionType === ReactionType.Swirl || reactionType === ReactionType.Crystallize) && element === Element.Electro);

export const FISCHL_CHARACTER_ID = 10_000_031;

// Fischl's behaviour: Nightrider casts Oz, landing its summon's hit, raised from two constellations, before its attacks,
// And Midnight Phantasmagoria casts the full Oz, or the Oz a swap spawns early, and from four constellations its extra
// Hit and her heal. One Oz stands at a time, a new one ending the one standing, attacking every tick from its first
// While it stands, longer from six constellations. Undone Be Thy Sinful Hex and the constellations answer the kit's
// Events. Stellar Predator and the skill's recast are not built
export const createFischlKitBehaviour = ({ readHit, readHitFields, readSeconds }: KitRecordReader): KitBehaviour => {
  const ozSummon = readHit("ozSummon");
  const devourerOfAllSins = readHit("devourerOfAllSins");
  const herPilgrimageOfBleak = readHit("herPilgrimageOfBleak");
  const thunderingRetribution = readHit("thunderingRetribution");
  const gazeOfTheDeep = readHit("gazeOfTheDeep");
  const evernightRavenFields = readHitFields("evernightRaven", ["hitArea"]);
  // Each of Oz's attacks, landing its hitmark after its tick
  const ozAttack = readHit("ozAttack");
  const ozSpawnSeconds = readSeconds("ozSpawn");
  const ozFirstTickSeconds = readSeconds("ozFirstTick");
  const ozTickIntervalSeconds = readSeconds("ozTickInterval");
  const ozSeconds = readSeconds("ozDuration");
  const evernightRavenExtraSeconds = readSeconds("evernightRavenOzExtension");
  const burstOzSpawnSeconds = readSeconds("burstOzSpawn");
  const burstOzFirstTickSeconds = readSeconds("burstOzFirstTick");
  const swapOzSpawnSeconds = readSeconds("burstShortOzSpawn");
  const swapOzFirstTickSeconds = readSeconds("burstShortOzFirstTick");
  const herPilgrimageOfBleakHealSeconds = readSeconds("herPilgrimageOfBleakHeal");
  // Oz cast where the body stands, spawning at the seconds given and landing the hits given before its attacks, one each
  // Tick from its first while it stands, each its hitmark after its tick. It ends the Oz standing, and stands longer from
  // Six constellations
  const castOz = (
    kitEffectState: KitEffectState,
    body: KitBody,
    combatant: Combatant,
    { firstTickSeconds, hits, spawnSeconds }: { firstTickSeconds: number; hits: KitHit[]; spawnSeconds: number },
  ): void => {
    for (const effect of kitEffectState.effects)
      if (effect.kind === "summon" && effect.id === OZ_SUMMON_ID) effect.secondsRemaining = 0;
    const seconds =
      combatant.constellationCount >= EVERNIGHT_RAVEN_CONSTELLATION
        ? ozSeconds + evernightRavenExtraSeconds
        : ozSeconds;
    const ozAttacks = Array.from(
      { length: Math.ceil((seconds - firstTickSeconds) / ozTickIntervalSeconds) },
      (_value, index): KitHit => ({
        ...ozAttack,
        hitmarkSeconds: spawnSeconds + firstTickSeconds + ozAttack.hitmarkSeconds + ozTickIntervalSeconds * index,
      }),
    );
    castKitSummon(kitEffectState, body, combatant, [...hits, ...ozAttacks], {
      attackTag: AttackTag.ElementalSkill,
      id: OZ_SUMMON_ID,
      spawnSeconds,
    });
  };
  return {
    // Oz spawns from the burst's start and attacks from there. From four constellations its extra hit lands round the
    // Body first, and a frame after Oz spawns she heals
    burst: {
      onStart: ({ activeCombatant: combatant, body, kitEffectState }) => {
        castOz(kitEffectState, body, combatant, {
          firstTickSeconds: burstOzFirstTickSeconds,
          hits: [],
          spawnSeconds: burstOzSpawnSeconds,
        });
        if (combatant.constellationCount < HER_PILGRIMAGE_OF_BLEAK_CONSTELLATION) return;
        castKitSummon(kitEffectState, body, combatant, [herPilgrimageOfBleak], { attackTag: AttackTag.ElementalBurst });
        scheduleKitTask(kitEffectState, combatant.characterId, herPilgrimageOfBleakHealSeconds, (tick) => {
          changeKitMemberHealth(
            tick,
            combatant,
            combatant.characterId,
            HER_PILGRIMAGE_OF_BLEAK_HEALTH_SHARE *
              getKitMaxHealth(combatant, tick.kitEffectState.effects, tick.party, tick.characterIdCombatantMap),
          );
        });
      },
    },
    onKitEvent: (event, { activeCombatant, body, kitEffectState }, combatant) => {
      const { ascension, characterId, constellationCount } = combatant;
      const { effects } = kitEffectState;
      // A swap during the burst spawns its Oz at once rather than at the full Oz's spawn
      if (event.kind === KitEventKind.CharacterSwapped) {
        if (event.previousCharacterId !== characterId) return;
        const pendingOz = effects.find(
          (effect): effect is KitSummon =>
            effect.kind === "summon" &&
            effect.id === OZ_SUMMON_ID &&
            effect.spawnSeconds === burstOzSpawnSeconds &&
            effect.elapsedSeconds < effect.spawnSeconds,
        );
        if (pendingOz)
          castOz(kitEffectState, pendingOz.body, pendingOz.combatant, {
            firstTickSeconds: swapOzFirstTickSeconds,
            hits: [],
            spawnSeconds: swapOzSpawnSeconds,
          });
      } else if (event.kind === KitEventKind.ReactionTriggered) {
        const { enemy, reactions, striker } = event;
        const activeCharacterId = activeCombatant.characterId;
        if (
          ascension < UNDONE_BE_THY_SINFUL_HEX_ASCENSION ||
          striker.characterId !== activeCharacterId ||
          !reactions.some((reaction) => checkIsElectroReaction(reaction))
        )
          return;
        const oz = findStandingKitSummon(effects, OZ_SUMMON_ID, characterId);
        if (
          !oz ||
          !startKitCooldown(
            kitEffectState,
            activeCharacterId,
            THUNDERING_RETRIBUTION_COOLDOWN_STATUS_ID,
            THUNDERING_RETRIBUTION_COOLDOWN_SECONDS,
          )
        )
          return;
        castKitSummon(kitEffectState, createKitBody(enemy.position), oz.combatant, [thunderingRetribution], {
          attackTag: AttackTag.ElementalSkill,
        });
      } else if (event.kind === KitEventKind.NormalAttackLanded) {
        const oz = findStandingKitSummon(effects, OZ_SUMMON_ID, characterId);
        const [normalAttackHit] = event.action.hits;
        // Evernight Raven's attack is Oz's own, reaching as far as the normal attack it follows
        if (oz && normalAttackHit && constellationCount >= EVERNIGHT_RAVEN_CONSTELLATION)
          castKitSummon(
            kitEffectState,
            body,
            oz.combatant,
            [{ ...ozAttack, ...evernightRavenFields, hitArea: normalAttackHit.hitArea }],
            { attackTag: AttackTag.ElementalSkill },
          );
        else if (
          !oz &&
          activeCombatant.characterId === characterId &&
          constellationCount >= GAZE_OF_THE_DEEP_CONSTELLATION
        )
          castKitSummon(kitEffectState, body, combatant, [gazeOfTheDeep], { attackTag: AttackTag.NormalAttack });
      }
    },
    // Oz spawns from the press, lands its summon's hit and attacks from its first tick
    skill: {
      onStart: ({ activeCombatant: combatant, body, kitEffectState }) => {
        castOz(kitEffectState, body, combatant, {
          firstTickSeconds: ozFirstTickSeconds,
          hits: [combatant.constellationCount >= DEVOURER_OF_ALL_SINS_CONSTELLATION ? devourerOfAllSins : ozSummon],
          spawnSeconds: ozSpawnSeconds,
        });
      },
    },
  };
};
