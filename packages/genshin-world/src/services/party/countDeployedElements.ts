import type { Element } from "#src/models/Element";

// How many of the deployed members are drawn in one of the given elements, none for a combatant built with no team
export const countDeployedElements = (
  deployedElements: readonly (Element | undefined)[] | undefined,
  elements: readonly Element[],
): number => (deployedElements ?? []).filter((element) => element !== undefined && elements.includes(element)).length;
