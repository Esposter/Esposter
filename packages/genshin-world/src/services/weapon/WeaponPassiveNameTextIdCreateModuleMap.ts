import type { WeaponPassiveModule } from "#src/models/weapon/WeaponPassiveModule";

import { Element } from "#src/models/Element";
import { createBaneOfElementsPassiveModule } from "#src/services/weapon/passives/createBaneOfElementsPassiveModule";
import { createCrushPassiveModule } from "#src/services/weapon/passives/createCrushPassiveModule";
import { createFullHPCriticUpPassiveModule } from "#src/services/weapon/passives/createFullHPCriticUpPassiveModule";
import { createGildingPassiveModule } from "#src/services/weapon/passives/createGildingPassiveModule";
import { createInfusionArrowPassiveModule } from "#src/services/weapon/passives/createInfusionArrowPassiveModule";
import { createInfusionBladePassiveModule } from "#src/services/weapon/passives/createInfusionBladePassiveModule";
import { createInfusionNeedlePassiveModule } from "#src/services/weapon/passives/createInfusionNeedlePassiveModule";
import { createInfusionScrollPassiveModule } from "#src/services/weapon/passives/createInfusionScrollPassiveModule";
import { createInfusionStingerPassiveModule } from "#src/services/weapon/passives/createInfusionStingerPassiveModule";
import { createMagicAffinityPassiveModule } from "#src/services/weapon/passives/createMagicAffinityPassiveModule";
import { createSmashedStonePassiveModule } from "#src/services/weapon/passives/createSmashedStonePassiveModule";
import { createUnreturningPassiveModule } from "#src/services/weapon/passives/createUnreturningPassiveModule";

// Each passive whose module is built, by the text id of its name, which a weapon's record holds, so a weapon's passive is
// Found by the name its table gives it. A passive with no module here gives its wielder nothing
export const WeaponPassiveNameTextIdCreateModuleMap: Readonly<
  Partial<Record<string, (params: number[]) => WeaponPassiveModule>>
> = {
  // Full HP Critic Up
  "2866125259": createFullHPCriticUpPassiveModule,
  // Infusion Scroll
  "1663313163": createInfusionScrollPassiveModule,
  // Bane of Water and Ice
  "523615731": (params) => createBaneOfElementsPassiveModule([Element.Hydro, Element.Cryo], params),
  // Bane of Fire and Thunder
  "2101250155": (params) => createBaneOfElementsPassiveModule([Element.Pyro, Element.Electro], params),
  // Bane of Storm and Tide
  "2612787355": (params) => createBaneOfElementsPassiveModule([Element.Hydro, Element.Electro], params),
  // Bane of Flame and Water
  "1958685971": (params) => createBaneOfElementsPassiveModule([Element.Hydro, Element.Pyro], params),
  // Smashed Stone
  "2507863163": createSmashedStonePassiveModule,
  // Infusion Blade
  "2323524931": createInfusionBladePassiveModule,
  // Infusion Arrow
  "2843293987": createInfusionArrowPassiveModule,
  // Infusion Stinger
  "3208149443": createInfusionStingerPassiveModule,
  // Crush
  "2430074939": createCrushPassiveModule,
  // Magic Affinity
  "734556419": createMagicAffinityPassiveModule,
  // Infusion Needle
  "1859047483": createInfusionNeedlePassiveModule,
  // Gilding
  "1373283795": createGildingPassiveModule,
  // Unreturning
  "1166144531": createUnreturningPassiveModule,
};
