import type { CharacterConstellationKit } from "#src/models/character/CharacterConstellationKit";
import type { CharacterSkillKit } from "#src/models/character/CharacterSkillKit";
import type { Constellation } from "#src/models/character/Constellation";
import type { Element } from "#src/models/Element";

// The constellations of the set the Traveler's element picks, once that element's set is unlocked: the skill set whose
// Burst deals the element names the set by its id, and the constellation table holds that set under the same id. Until
// A statue gives an element, or while its set's source is not done, there is none, undefined
export const getTravelerConstellations = (
  constellationKit: CharacterConstellationKit,
  skillKit: CharacterSkillKit,
  element: Element | undefined,
  unlockedElements: ReadonlySet<Element>,
): Constellation[] | undefined => {
  if (element === undefined || !unlockedElements.has(element)) return undefined;
  const skillDepot = skillKit.depots.find(({ burst }) => burst?.element === element);
  if (!skillDepot) return undefined;
  return constellationKit.depots.find(({ depotId }) => depotId === skillDepot.depotId)?.constellations;
};
