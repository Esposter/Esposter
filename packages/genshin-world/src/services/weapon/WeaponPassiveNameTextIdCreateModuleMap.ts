import type { WeaponPassiveModule } from "#src/models/weapon/WeaponPassiveModule";

import { ReactionType } from "#src/models/combat/ReactionType";
import { Element } from "#src/models/Element";
import { createBaneOfElementsPassiveModule } from "#src/services/weapon/passives/createBaneOfElementsPassiveModule";
import { createBaneOfTheSoftPassiveModule } from "#src/services/weapon/passives/createBaneOfTheSoftPassiveModule";
import { createBluntConclusionPassiveModule } from "#src/services/weapon/passives/createBluntConclusionPassiveModule";
import { createCouragePassiveModule } from "#src/services/weapon/passives/createCouragePassiveModule";
import { createCrushPassiveModule } from "#src/services/weapon/passives/createCrushPassiveModule";
import { createCullTheWeakPassiveModule } from "#src/services/weapon/passives/createCullTheWeakPassiveModule";
import { createDecimatePassiveModule } from "#src/services/weapon/passives/createDecimatePassiveModule";
import { createDeterminationPassiveModule } from "#src/services/weapon/passives/createDeterminationPassiveModule";
import { createElementalMasteryPassiveModule } from "#src/services/weapon/passives/createElementalMasteryPassiveModule";
import { createFullHPCriticUpPassiveModule } from "#src/services/weapon/passives/createFullHPCriticUpPassiveModule";
import { createGashPassiveModule } from "#src/services/weapon/passives/createGashPassiveModule";
import { createGildingPassiveModule } from "#src/services/weapon/passives/createGildingPassiveModule";
import { createGuerillaTacticsPassiveModule } from "#src/services/weapon/passives/createGuerillaTacticsPassiveModule";
import { createHeavyPassiveModule } from "#src/services/weapon/passives/createHeavyPassiveModule";
import { createHeritagePassiveModule } from "#src/services/weapon/passives/createHeritagePassiveModule";
import { createInfusionArrowPassiveModule } from "#src/services/weapon/passives/createInfusionArrowPassiveModule";
import { createInfusionBladePassiveModule } from "#src/services/weapon/passives/createInfusionBladePassiveModule";
import { createInfusionNeedlePassiveModule } from "#src/services/weapon/passives/createInfusionNeedlePassiveModule";
import { createInfusionScrollPassiveModule } from "#src/services/weapon/passives/createInfusionScrollPassiveModule";
import { createInfusionStingerPassiveModule } from "#src/services/weapon/passives/createInfusionStingerPassiveModule";
import { createMagicAffinityPassiveModule } from "#src/services/weapon/passives/createMagicAffinityPassiveModule";
import { createParticleHealPassiveModule } from "#src/services/weapon/passives/createParticleHealPassiveModule";
import { createPrecisePassiveModule } from "#src/services/weapon/passives/createPrecisePassiveModule";
import { createReactionAttackPassiveModule } from "#src/services/weapon/passives/createReactionAttackPassiveModule";
import { createSharpPassiveModule } from "#src/services/weapon/passives/createSharpPassiveModule";
import { createSmashedStonePassiveModule } from "#src/services/weapon/passives/createSmashedStonePassiveModule";
import { createUnbendingPassiveModule } from "#src/services/weapon/passives/createUnbendingPassiveModule";
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
  // Journey
  "3982568907": createParticleHealPassiveModule,
  // Energy Shower
  "2433054179": createParticleHealPassiveModule,
  // Overloaded
  "4047629611": (params) =>
    createReactionAttackPassiveModule(
      [
        { reactionType: ReactionType.Overloaded },
        { reactionType: ReactionType.Superconduct },
        { reactionType: ReactionType.ElectroCharged },
        { reactionType: ReactionType.Quicken },
        { reactionType: ReactionType.Aggravate },
        { reactionType: ReactionType.Hyperbloom },
        { reactionType: ReactionType.LunarCharged },
        { element: Element.Electro, reactionType: ReactionType.Swirl },
      ],
      params,
    ),
  // Residual Heat
  "3668842531": (params) =>
    createReactionAttackPassiveModule(
      [
        { reactionType: ReactionType.Overloaded },
        { reactionType: ReactionType.Melt },
        { reactionType: ReactionType.Burning },
        { reactionType: ReactionType.Vaporize },
        { reactionType: ReactionType.Burgeon },
        { element: Element.Pyro, reactionType: ReactionType.Swirl },
      ],
      params,
    ),
  // Rapids
  "4164346355": (params) =>
    createReactionAttackPassiveModule(
      [
        { reactionType: ReactionType.Vaporize },
        { reactionType: ReactionType.ElectroCharged },
        { reactionType: ReactionType.Frozen },
        { reactionType: ReactionType.Bloom },
        { reactionType: ReactionType.LunarCharged },
        { reactionType: ReactionType.LunarBloom },
        { element: Element.Hydro, reactionType: ReactionType.Swirl },
      ],
      params,
    ),
  // Gash
  "3397833923": createGashPassiveModule,
  // Determination
  "94261419": createDeterminationPassiveModule,
  // Unbending
  "99463579": createUnbendingPassiveModule,
  // Cull the Weak (White Iron Greatsword)
  "2479230075": createCullTheWeakPassiveModule,
  // Cull the Weak (Recurve Bow)
  "3707047091": createCullTheWeakPassiveModule,
  // Cull the Weak (The Flagstaff; its name text is TBD in the dump)
  "2951249275": createCullTheWeakPassiveModule,
  // Blunt Conclusion
  "2276876379": createBluntConclusionPassiveModule,
  // Courage
  "3197151587": createCouragePassiveModule,
  // Sharp
  "4054406475": createSharpPassiveModule,
  // Heavy
  "1364561971": createHeavyPassiveModule,
  // Bane of the Soft
  "651784635": createBaneOfTheSoftPassiveModule,
  // Heritage
  "110253283": createHeritagePassiveModule,
  // Guerilla Tactics
  "2615715275": createGuerillaTacticsPassiveModule,
  // Elemental Mastery
  "1944680691": createElementalMasteryPassiveModule,
  // Precise
  "1849455683": createPrecisePassiveModule,
  // Decimate
  "174540131": createDecimatePassiveModule,
};
