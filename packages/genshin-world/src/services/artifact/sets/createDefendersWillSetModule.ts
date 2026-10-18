import type { ArtifactSetBonus } from "#src/models/artifact/ArtifactSetBonus";
import type { ArtifactSetModule } from "#src/models/artifact/ArtifactSetModule";

import { Attribute } from "#src/models/character/Attribute";
import { Element } from "#src/models/Element";
import { takeOne } from "@esposter/shared";

const ELEMENT_RESISTANCE_ATTRIBUTE_MAP: Readonly<Record<Element, Attribute>> = {
  [Element.Anemo]: Attribute.AnemoResistance,
  [Element.Cryo]: Attribute.CryoResistance,
  [Element.Dendro]: Attribute.DendroResistance,
  [Element.Electro]: Attribute.ElectroResistance,
  [Element.Geo]: Attribute.GeoResistance,
  [Element.Hydro]: Attribute.HydroResistance,
  [Element.Pyro]: Attribute.PyroResistance,
};

// Defender's Will's four-piece bonus: the Elemental RES its wearer gains to each different element its team holds,
// At the amount in the table's only param, so one element counts once however many members draw in it
export const createDefendersWillSetModule = ({ params }: ArtifactSetBonus): ArtifactSetModule => {
  const amount = takeOne(params, 0);
  return {
    getPassiveBonuses: (combatant) =>
      Array.from(new Set(combatant.deployedElements)).flatMap((element) =>
        element === undefined ? [] : [{ amount, attribute: ELEMENT_RESISTANCE_ATTRIBUTE_MAP[element] }],
      ),
  };
};
