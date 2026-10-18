import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { Party } from "#src/models/party/Party";

import { DisorderDefinitionMap } from "#src/services/domains/DisorderDefinitionMap";
import { getDomainDisorderSource } from "#src/services/domains/getDomainDisorderSource";
import { buffKitTeam } from "#src/services/kit/effects/buffKitTeam";

// Gives every member of the deployed team a constant disorder's bonus, for the seconds the challenge is given
export const applyDomainDisorder = (
  kitEffectState: KitEffectState,
  party: Party,
  disorder: string,
  seconds: number,
): void => {
  const definition = DisorderDefinitionMap[disorder];
  if (definition?.kind !== "constant") return;
  buffKitTeam(kitEffectState, party, {
    amount: definition.amount,
    attribute: definition.attribute,
    secondsRemaining: seconds,
    source: getDomainDisorderSource(disorder, 0),
  });
};
