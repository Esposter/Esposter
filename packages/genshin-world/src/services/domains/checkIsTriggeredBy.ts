import type { DomainDisorder } from "#src/models/domains/DomainDisorder";
import type { DomainDisorderTrigger } from "#src/models/domains/DomainDisorderTrigger";

// Whether a trigger is one the disorder answers to: a change to HP of either sign, or a reaction its predicate names
export const checkIsTriggeredBy = (
  definition: Exclude<DomainDisorder, { kind: "constant" }>,
  trigger: DomainDisorderTrigger,
): boolean => {
  if (definition.kind === "healthChange") return trigger.kind === "healthChange" && trigger.healthShare !== 0;
  return trigger.kind === "reaction" && trigger.reactions.some((reaction) => definition.matches(reaction));
};
