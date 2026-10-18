import type { Combatant } from "#src/models/kit/Combatant";
import type { KitContext } from "#src/models/kit/KitContext";
import type { KitEffect } from "#src/models/kit/KitEffect";
import type { KitStrike } from "#src/models/kit/KitStrike";
import type { PassiveModule } from "#src/models/kit/PassiveModule";
import type { Party } from "#src/models/party/Party";

import { KitEventKind } from "#src/models/kit/KitEventKind";
import { checkIsKitHexerei } from "#src/services/kit/countKitHexereiMembers";
import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { checkIsKitStatusActive } from "#src/services/kit/effects/checkIsKitStatusActive";
import { getBuffedCombatant } from "#src/services/kit/effects/getBuffedCombatant";
import { startKitCooldown } from "#src/services/kit/effects/startKitCooldown";
import { gainPartyMemberEnergy } from "#src/services/party/gainPartyMemberEnergy";
import { getActiveCharacterId } from "#src/services/party/getActiveCharacterId";
import { takeOne } from "@esposter/shared";

const PATHFINDERS_LIGHT_ID = "pathfindersLight";
const GUIDES_CONTENTMENT_COOLDOWN_ID = "guidesContentmentCooldown";

const checkHasPathfindersLight = (effects: readonly KitEffect[], characterId: number): boolean =>
  checkIsKitStatusActive(effects, characterId, PATHFINDERS_LIGHT_ID);

// Crown of the Final Scion (Angelos' Heptades) at its rank. Its ATK line is the table's. A shield its wielder casts
// Gives it Pathfinder's Light for the rank's seconds: the member on the field deals the rank's DMG Bonus more for each
// Step of the wielder's ATK, up to its cap, and a Hexerei member off the field the Hexerei share of it, as gcsim's
// Angelosheptades.go reads each character's attack mod. The shield, or a chest opened, also gives Guide's Contentment,
// The rank's Energy restored to the wielder, once every cooldown
export const createCrownOfTheFinalScionPassiveModule = (params: number[]): PassiveModule => {
  const attackStep = takeOne(params, 1);
  const damageBonusPerStep = takeOne(params, 2);
  const maximumDamageBonus = takeOne(params, 3);
  const pathfindersLightSeconds = takeOne(params, 4);
  const energy = takeOne(params, 5);
  const cooldownSeconds = takeOne(params, 6);
  const hexereiShare = takeOne(params, 7);
  // The share of Pathfinder's Light a striker takes: all of it on the field, the Hexerei share off it if it is Hexerei
  const getStrikerShare = ({ combatant: { characterId } }: KitStrike, party: Party): number => {
    if (characterId === getActiveCharacterId(party)) return 1;
    return checkIsKitHexerei(characterId) ? hexereiShare : 0;
  };
  // The DMG Bonus Pathfinder's Light gives at the wielder's ATK, as the wielder is priced
  const getPathfindersLightDamageBonus = (wielder: Combatant): number =>
    Math.min((wielder.attributes.attack / attackStep) * damageBonusPerStep, maximumDamageBonus);
  const restoreEnergy = ({ kitEffectState, party }: KitContext, combatant: Combatant): void => {
    if (startKitCooldown(kitEffectState, combatant.characterId, GUIDES_CONTENTMENT_COOLDOWN_ID, cooldownSeconds))
      gainPartyMemberEnergy(party, combatant, energy);
  };
  return {
    getPartyStrikeBonus: (member, strike, _enemy, party, effects, characterIdCombatantMap) => {
      if (!checkHasPathfindersLight(effects, member.characterId)) return {};
      const share = getStrikerShare(strike, party);
      if (share === 0) return {};
      const buffedMember = getBuffedCombatant(member, effects, party, characterIdCombatantMap);
      return { damageBonus: share * getPathfindersLightDamageBonus(buffedMember) };
    },
    // The wielder's own strike carries it as it is priced, so its ATK is read from the strike
    getStrikeDamageBonus: (strike, _enemy, party, effects) =>
      checkHasPathfindersLight(effects, strike.combatant.characterId)
        ? getStrikerShare(strike, party) * getPathfindersLightDamageBonus(strike.combatant)
        : 0,
    onKitEvent: (event, context, combatant) => {
      if (event.kind === KitEventKind.ShieldCast && event.shield.characterId === combatant.characterId) {
        addKitStatus(context.kitEffectState, combatant.characterId, {
          id: PATHFINDERS_LIGHT_ID,
          secondsRemaining: pathfindersLightSeconds,
        });
        restoreEnergy(context, combatant);
      } else if (event.kind === KitEventKind.ChestOpened) restoreEnergy(context, combatant);
    },
  };
};
