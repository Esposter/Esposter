import type { ArtifactSetBonus } from "#src/models/artifact/ArtifactSetBonus";
import type { PassiveModule } from "#src/models/kit/PassiveModule";

import { Element } from "#src/models/Element";
import { createAuraDamageSetModule } from "#src/services/artifact/sets/createAuraDamageSetModule";
import { takeOne } from "@esposter/shared";

// Lavawalker. Its four-piece bonus raises the DMG its wearer's strikes deal to an enemy under Pyro by the table's first param
export const createLavawalkerSetModule = (bonus: ArtifactSetBonus): PassiveModule =>
  createAuraDamageSetModule({ amount: takeOne(bonus.params, 0), element: Element.Pyro });
