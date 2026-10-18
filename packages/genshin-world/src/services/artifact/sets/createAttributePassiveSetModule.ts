import type { Attribute } from "#src/models/character/Attribute";
import type { PassiveModule } from "#src/models/kit/PassiveModule";

// A set's bonus that prices its wearer at the amount in each of the attributes given, whatever the wearer is doing
export const createAttributePassiveSetModule = (attributes: Attribute[], amount: number): PassiveModule => ({
  getPassiveBonuses: () => attributes.map((attribute) => ({ amount, attribute })),
});
