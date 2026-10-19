import type { ArtifactSetBonus } from "#src/models/artifact/ArtifactSetBonus";
import type { PassiveModule } from "#src/models/kit/PassiveModule";

import { KitEventKind } from "#src/models/kit/KitEventKind";
import { WeaponType } from "#src/models/weapon/WeaponType";
import { startKitCooldown } from "#src/services/kit/effects/startKitCooldown";
import { checkIsCharacterDown } from "#src/services/party/checkIsCharacterDown";
import { gainPartyMemberEnergy } from "#src/services/party/gainPartyMemberEnergy";
import { getDeployedCharacterIds } from "#src/services/party/getDeployedCharacterIds";
import { takeOne } from "@esposter/shared";

const SCHOLAR_COOLDOWN_ID = "scholarCooldown";
// The text's 3 seconds, not the parameter list's, which carries only the energy
const SCHOLAR_COOLDOWN_SECONDS = 3;

// Scholar. Its four-piece bonus, when gathered particles or orbs reach the party, gives the table's first param of Energy to
// Each standing member wielding a bow or a catalyst. It triggers once every 3 seconds
export const createScholarSetModule = (bonus: ArtifactSetBonus): PassiveModule => {
  const energy = takeOne(bonus.params, 0);
  return {
    onKitEvent: (event, context, combatant) => {
      if (
        event.kind !== KitEventKind.EnergyParticleCollected ||
        !startKitCooldown(context.kitEffectState, combatant.characterId, SCHOLAR_COOLDOWN_ID, SCHOLAR_COOLDOWN_SECONDS)
      )
        return;
      for (const characterId of getDeployedCharacterIds(context.party)) {
        const member = context.characterIdCombatantMap.get(characterId);
        if (
          !member ||
          checkIsCharacterDown(context.party, characterId) ||
          (member.weaponType !== WeaponType.Bow && member.weaponType !== WeaponType.Catalyst)
        )
          continue;
        gainPartyMemberEnergy(context.party, member, energy);
      }
    },
  };
};
