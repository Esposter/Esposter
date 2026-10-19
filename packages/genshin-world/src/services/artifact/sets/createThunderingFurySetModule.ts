import type { ArtifactSetBonus } from "#src/models/artifact/ArtifactSetBonus";
import type { Reaction } from "#src/models/combat/Reaction";
import type { PassiveModule } from "#src/models/kit/PassiveModule";

import { CatalyzeReactionType } from "#src/models/combat/CatalyzeReactionType";
import { LunarReactionType } from "#src/models/combat/LunarReactionType";
import { ReactionType } from "#src/models/combat/ReactionType";
import { TransformativeReactionType } from "#src/models/combat/TransformativeReactionType";
import { getOwnReactionDamageBonus } from "#src/services/artifact/sets/getOwnReactionDamageBonus";
import { checkIsOwnReactionTriggered } from "#src/services/kit/checkIsOwnReactionTriggered";
import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { changeKitSkillCooldown } from "#src/services/kit/effects/changeKitSkillCooldown";
import { checkIsKitStatusActive } from "#src/services/kit/effects/checkIsKitStatusActive";
import { getActiveCharacterId } from "#src/services/party/getActiveCharacterId";
import { takeOne } from "@esposter/shared";

const THUNDERING_FURY_COOLDOWN_ID = "thunderingFuryCooldown";
// The Elemental Skill cooldown a cut takes off, a second, which gcsim (MIT) internal/artifacts/thunderingfury/thunderingfury.go
// Lowers by 60 frames
const SKILL_COOLDOWN_CUT_SECONDS = 1;
// The reactions the four-piece's first param raises the wearer's own DMG of
const TRANSFORMATIVE_REACTION_TYPES = new Set<ReactionType>([
  TransformativeReactionType.ElectroCharged,
  TransformativeReactionType.Hyperbloom,
  TransformativeReactionType.Overloaded,
  TransformativeReactionType.Superconduct,
]);
// The reactions that cut the Elemental Skill cooldown, with Quicken, as gcsim's reduce subscribes to them
const CUT_REACTION_TYPES = new Set<ReactionType>([
  ...TRANSFORMATIVE_REACTION_TYPES,
  CatalyzeReactionType.Aggravate,
  LunarReactionType.LunarCharged,
  ReactionType.Quicken,
  ReactionType.StellarConduct,
]);
// A summon's reaction cuts only by a Hyperbloom, as gcsim's reduce takes it from any source
const checkIsCutReaction = ({ reactionType }: Reaction, isGadget?: true): boolean =>
  CUT_REACTION_TYPES.has(reactionType) && (!isGadget || reactionType === TransformativeReactionType.Hyperbloom);

// Thundering Fury's four-piece. Its first param raises the DMG its wearer's own Overloaded, Electro-Charged, Superconduct and
// Hyperbloom deal, its third the DMG its own Aggravate deals, and its fourth the DMG its own Lunar-Charged deals. The Stellar-Conduct
// Share of the fourth is not read, as a Stellar-Conduct deals no damage yet. Its second param is the seconds between cuts: while the
// Wearer is the active character, a Quicken or one of those reactions the wearer triggers cuts its Elemental Skill cooldown by a
// Second, once per those seconds. A summon's hit cuts only by a Hyperbloom, as gcsim's reduceNoGadget takes the rest from an
// Enemy's event alone
export const createThunderingFurySetModule = (bonus: ArtifactSetBonus): PassiveModule => {
  const transformativeDamageBonus = takeOne(bonus.params, 0);
  const cutCooldownSeconds = takeOne(bonus.params, 1);
  const aggravateDamageBonus = takeOne(bonus.params, 2);
  const lunarChargedDamageBonus = takeOne(bonus.params, 3);
  const reactionTypeDamageBonusMap = new Map<ReactionType, number>([
    ...Array.from(TRANSFORMATIVE_REACTION_TYPES, (reactionType) => [reactionType, transformativeDamageBonus] as const),
    [CatalyzeReactionType.Aggravate, aggravateDamageBonus],
    [LunarReactionType.LunarCharged, lunarChargedDamageBonus],
  ]);
  return {
    getPartyReactionBonus: (member, reaction) =>
      getOwnReactionDamageBonus(member, reaction, reactionTypeDamageBonusMap),
    onKitEvent: (event, { kitEffectState, party }, combatant) => {
      const { characterId } = combatant;
      if (!checkIsOwnReactionTriggered(event, combatant) || getActiveCharacterId(party) !== characterId) return;
      if (!event.reactions.some((reaction) => checkIsCutReaction(reaction, event.isGadget))) return;
      if (checkIsKitStatusActive(kitEffectState.effects, characterId, THUNDERING_FURY_COOLDOWN_ID)) return;
      addKitStatus(kitEffectState, characterId, {
        id: THUNDERING_FURY_COOLDOWN_ID,
        secondsRemaining: cutCooldownSeconds,
      });
      changeKitSkillCooldown(party, characterId, -SKILL_COOLDOWN_CUT_SECONDS);
    },
  };
};
