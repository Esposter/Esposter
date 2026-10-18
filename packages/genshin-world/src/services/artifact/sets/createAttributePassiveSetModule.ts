import type { Attribute } from "#src/models/character/Attribute";
import type { ArtifactSetModule } from "#src/models/artifact/ArtifactSetModule";

// A set's bonus that prices its wearer at the amount in each of the attributes given, whatever the wearer is doing
export const createAttributePassiveSetModule = (attributes: Attribute[], amount: number): ArtifactSetModule => ({
  getPassiveBonuses: () => attributes.map((attribute) => ({ amount, attribute })),
});
