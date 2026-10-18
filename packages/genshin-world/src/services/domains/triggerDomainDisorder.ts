import type { DomainDisorderTrigger } from "#src/models/domains/DomainDisorderTrigger";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { Party } from "#src/models/party/Party";

import { DisorderDefinitionMap } from "#src/services/domains/DisorderDefinitionMap";
import { findFreeStack } from "#src/services/domains/findFreeStack";
import { getDomainDisorderSource } from "#src/services/domains/getDomainDisorderSource";
import { isTriggeredBy } from "#src/services/domains/isTriggeredBy";
import { buffKitTeam } from "#src/services/kit/effects/buffKitTeam";

// Gives the team a triggered disorder's bonus when its trigger lands, and returns the seconds the disorder may trigger
// Again. A trigger inside its cooldown, or one with every stack given, changes nothing and keeps the seconds it was given
export const triggerDomainDisorder = (
  kitEffectState: KitEffectState,
  party: Party,
  disorder: string,
  trigger: DomainDisorderTrigger,
  nowSeconds: number,
  readySeconds: number,
): number => {
  const definition = DisorderDefinitionMap[disorder];
  if (!definition || definition.kind === "constant" || nowSeconds < readySeconds || !isTriggeredBy(definition, trigger))
    return readySeconds;
  const stack = definition.maxStacks === undefined ? 0 : findFreeStack(kitEffectState, disorder, definition.maxStacks);
  if (stack === undefined) return readySeconds;
  buffKitTeam(kitEffectState, party, {
    amount: definition.amount,
    attribute: definition.attribute,
    secondsRemaining: definition.seconds,
    source: getDomainDisorderSource(disorder, stack),
  });
  return nowSeconds + definition.cooldownSeconds;
};
