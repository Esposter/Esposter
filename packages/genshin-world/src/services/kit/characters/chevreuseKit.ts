import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitContext } from "#src/models/kit/KitContext";

import { Attribute } from "#src/models/character/Attribute";
import { ReactionType } from "#src/models/combat/ReactionType";
import { Element } from "#src/models/Element";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { buffKitMember } from "#src/services/kit/effects/buffKitMember";
import { changeKitSkillCooldown } from "#src/services/kit/effects/changeKitSkillCooldown";
import { checkHasKitStatus } from "#src/services/kit/effects/checkHasKitStatus";
import { findKitStatus } from "#src/services/kit/effects/findKitStatus";
import { getKitMaxHealth } from "#src/services/kit/effects/getKitMaxHealth";
import { removeKitEffects } from "#src/services/kit/effects/removeKitEffects";
import { getDeployedCharacterIds } from "#src/services/party/getDeployedCharacterIds";
import { getPartyMember } from "#src/services/party/getPartyMember";

export const CHEVREUSE_CHARACTER_ID = 10_000_090;

// Constellation 4: Ring of Bursting Grenades lets the next two holds within six seconds start with no cooldown, as gcsim
// (MIT) chevreuse/burst.go and skill.go give it, the status's two shots spent by each hold it lets through
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/chevreuse/skill.go
const CONSTELLATION_4 = 4;
const CONSTELLATION_4_SECONDS = 6;
const CONSTELLATION_4_SHOTS = 2;
const CONSTELLATION_4_STATUS_ID = "chevreuse-constellation-4";

// Overloaded reactions set the Overcharged Ball going for the next hold, as gcsim's overcharged-ball subscription does,
// Whoever triggers them, until a hold casts the ball
const OVERCHARGED_BALL_STATUS_ID = "chevreuse-overcharged-ball";
// Vertical Force Coordination, from Ascension 4, gives the Pyro and Electro members of the party 1% ATK for every 1,000 of
// Chevreuse's Max HP, up to 40%, for 30 seconds when the Overcharged Ball is fired, as gcsim (MIT) chevreuse/asc.go does
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/chevreuse/asc.go
const ASCENSION_4 = 4;
const VERTICAL_FORCE_ATK_PER_1000_MAX_HEALTH = 0.01;
const VERTICAL_FORCE_ATK_MAX = 0.4;
const VERTICAL_FORCE_ELEMENTS = new Set([Element.Electro, Element.Pyro]);
const VERTICAL_FORCE_SECONDS = 30;
const VERTICAL_FORCE_SOURCE = "chevreuse-ascension-4";

const grantVerticalForce = ({
  activeCombatant: combatant,
  characterIdCombatantMap,
  kitEffectState,
  party,
}: KitContext): void => {
  const maxHealth = getKitMaxHealth(combatant, kitEffectState.effects, party, characterIdCombatantMap);
  const amount = Math.min((maxHealth / 1000) * VERTICAL_FORCE_ATK_PER_1000_MAX_HEALTH, VERTICAL_FORCE_ATK_MAX);
  for (const characterId of getDeployedCharacterIds(party)) {
    const member = characterIdCombatantMap.get(characterId);
    if (!member?.element || !VERTICAL_FORCE_ELEMENTS.has(member.element)) continue;
    buffKitMember(kitEffectState, characterId, {
      amount,
      attribute: Attribute.AttackPercent,
      secondsRemaining: VERTICAL_FORCE_SECONDS,
      source: VERTICAL_FORCE_SOURCE,
    });
  }
};

// A hold the Constellation 4 status lets through spends one of its shots, and cuts its cooldown back to none. A hold
// Starts only once her skill is ready, so its cooldown was none before the start, and the cut takes all it runs
const waiveHoldCooldown = ({ activeCombatant: combatant, kitEffectState, party }: KitContext): void => {
  const waiver = findKitStatus(kitEffectState.effects, combatant.characterId, CONSTELLATION_4_STATUS_ID);
  if (!waiver || waiver.secondsRemaining <= 0 || (waiver.stacks ?? 0) <= 0) return;
  waiver.stacks = (waiver.stacks ?? 0) - 1;
  const { skillCooldownSeconds } = getPartyMember(party, combatant.characterId);
  changeKitSkillCooldown(party, combatant.characterId, -skillCooldownSeconds);
};

// Chevreuse's behaviour: an Overloaded reaction sets the Overcharged Ball going, and the hold casts the ball in place of
// Its own shot while it is going, spending it. Constellation 4 is built: Ring of Bursting Grenades sets a status that the
// Next two holds spend, and a hold it lets through starts with no cooldown. Constellation 1 needs the Coordinated
// Tactics status on other members, which the kit does not apply. Constellation 2 needs the chain explosions after the
// Hold hits a target, and Constellation 6 needs the hold's 12-second healing effect and the team heals it triggers
export const createChevreuseKitBehaviour = (): KitBehaviour => ({
  // Ring of Bursting Grenades sets the Constellation 4 waiver going, its two shots and six seconds restarted by each Ring
  burst: {
    onStart: ({ activeCombatant: combatant, kitEffectState }) => {
      if (combatant.constellationCount < CONSTELLATION_4) return;
      addKitStatus(kitEffectState, combatant.characterId, {
        id: CONSTELLATION_4_STATUS_ID,
        secondsRemaining: CONSTELLATION_4_SECONDS,
        stacks: CONSTELLATION_4_SHOTS,
      });
    },
  },
  // Overloaded from any source sets the ball going on the team's Chevreuse, as gcsim's subscription does, until a hold
  // Casts it. The status has no end, so it stands until a hold spends it
  onKitEvent: (event, { kitEffectState }, combatant) => {
    if (
      event.kind !== KitEventKind.ReactionTriggered ||
      !event.reactions.some(({ reactionType }) => reactionType === ReactionType.Overloaded)
    )
      return;
    if (checkHasKitStatus(kitEffectState.effects, combatant.characterId, OVERCHARGED_BALL_STATUS_ID)) return;
    addKitStatus(kitEffectState, combatant.characterId, {
      id: OVERCHARGED_BALL_STATUS_ID,
      secondsRemaining: Number.POSITIVE_INFINITY,
    });
  },
  skillHolds: [
    {
      onStart: waiveHoldCooldown,
      variant: {
        checkIsActive: ({ activeCombatant: combatant, kitEffectState }) =>
          checkHasKitStatus(kitEffectState.effects, combatant.characterId, OVERCHARGED_BALL_STATUS_ID),
        // The Overcharged Ball's hold spends the ball as it starts, so the next hold is a plain one again, and from
        // Ascension 4 the ball's firing gives the Pyro and Electro members their ATK. Constellation 4 waives its cooldown
        // As it does a plain hold's
        onStart: (context) => {
          removeKitEffects(
            context.kitEffectState,
            (effect) => effect.kind === "status" && effect.id === OVERCHARGED_BALL_STATUS_ID,
          );
          if (context.activeCombatant.ascension >= ASCENSION_4) grantVerticalForce(context);
          waiveHoldCooldown(context);
        },
      },
    },
  ],
});
