import type { Combatant } from "#src/models/kit/Combatant";
import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitContext } from "#src/models/kit/KitContext";
import type { KitEffect } from "#src/models/kit/KitEffect";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitHit } from "#src/models/kit/KitHit";
import type { KitRecordReader } from "#src/models/kit/KitRecordReader";

import { AttackTag } from "#src/models/combat/AttackTag";
import { Element } from "#src/models/Element";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { KitPlunge } from "#src/models/kit/record/KitPlunge";
import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { castKitSummon } from "#src/services/kit/effects/castKitSummon";
import { checkIsKitStatusActive } from "#src/services/kit/effects/checkIsKitStatusActive";
import { removeKitEffects } from "#src/services/kit/effects/removeKitEffects";
import { elementalMasteryMultiplier } from "#src/services/kit/elementalMasteryMultiplier";
import { getKitHitElement } from "#src/services/kit/getKitHitElement";

export const MIZUKI_CHARACTER_ID = 10_000_109;

// The Dreamdrifter state her press starts lasts five seconds, as gcsim (MIT) mizuki/skill.go's dreamDrifterBaseDuration
// Gives it, and its id is gcsim's dreamDrifterStateKey
export const DREAMDRIFTER_STATUS_ID = "dreamdrifter-state";
const DREAMDRIFTER_SECONDS = 5;
// The summon her press casts for its clouds, the name it is found by among the team's effects
const DREAMDRIFTER_CLOUDS_ID = "dreamdrifter-clouds";
// Constellation 2's DMG Bonus, for each point of her Elemental Mastery, on a party member's Pyro, Hydro, Cryo or Electro strike
// While she is in the state, as gcsim (MIT) mizuki/cons.go's c2EMMultiplier gives it
// https://github.com/genshinsim/gcsim/tree/v2.47.2/internal/characters/mizuki
const CONSTELLATION_2 = 2;
const CONSTELLATION_2_DAMAGE_BONUS_PER_ELEMENTAL_MASTERY = 0.0004;
const CONSTELLATION_2_ELEMENTS: ReadonlySet<Element> = new Set([
  Element.Cryo,
  Element.Electro,
  Element.Hydro,
  Element.Pyro,
]);

// While the state lasts she starts no attack, plunge or charged attack, as gcsim's ActionReady allows only her swap,
// Dash and burst. Each of her attacks and plunges, and the collision her plunge strikes, carries the check as its own gate
const checkCanStartAttack = ({ activeCombatant, kitEffectState }: KitContext): boolean =>
  !checkIsKitStatusActive(kitEffectState.effects, activeCombatant.characterId, DREAMDRIFTER_STATUS_ID);

// The DMG Bonus a party member's strike gets from Constellation 2 while Mizuki is in the state, read as the strike is priced,
// Where gcsim refreshes it every half second; the kit reads her live Elemental Mastery instead
const getConstellation2DamageBonus = (
  member: Combatant,
  striker: Combatant,
  hit: KitHit,
  effects: readonly KitEffect[],
): number => {
  const element = getKitHitElement(hit, striker);
  const isElementalDamage = element !== undefined && CONSTELLATION_2_ELEMENTS.has(element);
  return member.constellationCount >= CONSTELLATION_2 &&
    isElementalDamage &&
    checkIsKitStatusActive(effects, member.characterId, DREAMDRIFTER_STATUS_ID)
    ? elementalMasteryMultiplier(member, CONSTELLATION_2_DAMAGE_BONUS_PER_ELEMENTAL_MASTERY)
    : 0;
};

// Mizuki's behaviour: her skill's press enters the Dreamdrifter state for five seconds, and a press in it cancels the state,
// As gcsim's Skill does. While the state lasts its clouds launch at 18 frames and every 45 frames after, as gcsim's cloudTask
// Queues them (skill.go:221), and each lands its Anemo hit on the primary target's area 30 frames after its launch, the travel
// Gcsim's default press gives. A cancel, or her swap out, stops the clouds not yet launched, and the ones in flight still land,
// As gcsim's cancel does. While the state lasts she starts no attack, plunge or charged attack, as gcsim's ActionReady allows
// Only her swap, dash and burst. The press that cancels the state plays none of its skill's hits and sets no cooldown, as
// Gcsim's does, through the skill's state-ending check. Not built: the Swirl buff her state gives the party, the Yumemi Style
// Special Snacks her burst leaves, which are pick-ups the kit does not leave yet, and a press's parameter sets, which the kit
// Holds at the default
// https://github.com/genshinsim/gcsim/tree/v2.47.2/internal/characters/mizuki
// Constellation 1 needs the Dreamdrifter state and its Twenty-Three Nights' Awaiting effect, which are not built
// Constellation 4 needs the Yumemi Style Special Snacks from her burst, which the kit does not build
// Constellation 6 needs the Dreamdrifter state and a CRIT hook on the Swirl, which the kit does not build
export const createMizukiKitBehaviour = ({ kit, readHit, readSeconds }: KitRecordReader): KitBehaviour => {
  const cloud = readHit("cloud");
  const cloudFirstHitSeconds = readSeconds("cloudFirstHit");
  const cloudHitIntervalSeconds = readSeconds("cloudHitInterval");
  const cloudTravelSeconds = readSeconds("cloudTravelTime");
  // Each cloud the state launches while it lasts, its hit landing the travel after its launch
  const cloudHitmarkSeconds: number[] = [];
  for (
    let launchSeconds = cloudFirstHitSeconds;
    launchSeconds < DREAMDRIFTER_SECONDS;
    launchSeconds += cloudHitIntervalSeconds
  )
    cloudHitmarkSeconds.push(launchSeconds + cloudTravelSeconds);

  // Ends the state as gcsim's cancel does: the clouds not yet launched stop, and those in flight still land
  const endDreamdrifterState = (kitEffectState: KitEffectState, characterId: number) => {
    removeKitEffects(
      kitEffectState,
      (effect) =>
        effect.kind === "status" && effect.characterId === characterId && effect.id === DREAMDRIFTER_STATUS_ID,
    );
    for (const effect of kitEffectState.effects)
      if (effect.kind === "summon" && effect.id === DREAMDRIFTER_CLOUDS_ID)
        effect.hits = effect.hits.filter(
          ({ hitmarkSeconds }) => hitmarkSeconds - cloudTravelSeconds <= effect.elapsedSeconds,
        );
  };

  return {
    chargedAttack: { canStart: checkCanStartAttack },
    getPartyStrikeBonus: (member, { combatant, hit }, _enemy, _party, effects) => ({
      damageBonus: getConstellation2DamageBonus(member, combatant, hit, effects),
    }),
    normalAttacks: kit.normalAttacks.map(() => ({ canStart: checkCanStartAttack })),
    onKitEvent: (event, { kitEffectState }, { characterId }) => {
      if (
        event.kind === KitEventKind.CharacterSwapped &&
        event.previousCharacterId === characterId &&
        checkIsKitStatusActive(kitEffectState.effects, characterId, DREAMDRIFTER_STATUS_ID)
      )
        endDreamdrifterState(kitEffectState, characterId);
    },
    plungeCollision: { landsWhen: checkCanStartAttack },
    plunges: {
      [KitPlunge.High]: { canStart: checkCanStartAttack },
      [KitPlunge.Low]: { canStart: checkCanStartAttack },
    },
    skill: {
      checkIsStateEndingPress: ({ activeCombatant, kitEffectState }) =>
        checkIsKitStatusActive(kitEffectState.effects, activeCombatant.characterId, DREAMDRIFTER_STATUS_ID),
      onStart: ({ activeCombatant, body, kitEffectState }) => {
        const { characterId } = activeCombatant;
        if (checkIsKitStatusActive(kitEffectState.effects, characterId, DREAMDRIFTER_STATUS_ID))
          endDreamdrifterState(kitEffectState, characterId);
        else {
          addKitStatus(kitEffectState, characterId, {
            id: DREAMDRIFTER_STATUS_ID,
            secondsRemaining: DREAMDRIFTER_SECONDS,
          });
          const clouds: KitHit[] = [];
          for (const hitmarkSeconds of cloudHitmarkSeconds)
            clouds.push({ ...cloud, attackTag: AttackTag.ElementalSkill, hitmarkSeconds });
          castKitSummon(kitEffectState, body, activeCombatant, clouds, {
            attackTag: AttackTag.ElementalSkill,
            id: DREAMDRIFTER_CLOUDS_ID,
          });
        }
      },
    },
  };
};
