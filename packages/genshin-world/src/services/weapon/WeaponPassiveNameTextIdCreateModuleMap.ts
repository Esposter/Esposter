import type { WeaponPassiveModule } from "#src/models/weapon/WeaponPassiveModule";

import { ReactionType } from "#src/models/combat/ReactionType";
import { Element } from "#src/models/Element";
import { createAeonWavePassiveModule } from "#src/services/weapon/passives/createAeonWavePassiveModule";
import { createArchersMessagePassiveModule } from "#src/services/weapon/passives/createArchersMessagePassiveModule";
import { createBaneOfElementsPassiveModule } from "#src/services/weapon/passives/createBaneOfElementsPassiveModule";
import { createBaneOfTheSoftPassiveModule } from "#src/services/weapon/passives/createBaneOfTheSoftPassiveModule";
import { createBathhousesHawksAndNarukamiPassiveModule } from "#src/services/weapon/passives/createBathhousesHawksAndNarukamiPassiveModule";
import { createBenthicPulsePassiveModule } from "#src/services/weapon/passives/createBenthicPulsePassiveModule";
import { createBlackWingPassiveModule } from "#src/services/weapon/passives/createBlackWingPassiveModule";
import { createBluntConclusionPassiveModule } from "#src/services/weapon/passives/createBluntConclusionPassiveModule";
import { createBoltOfPerceptionPassiveModule } from "#src/services/weapon/passives/createBoltOfPerceptionPassiveModule";
import { createBoundlessBlessingPassiveModule } from "#src/services/weapon/passives/createBoundlessBlessingPassiveModule";
import { createChordPassiveModule } from "#src/services/weapon/passives/createChordPassiveModule";
import { createComposedPassiveModule } from "#src/services/weapon/passives/createComposedPassiveModule";
import { createCouragePassiveModule } from "#src/services/weapon/passives/createCouragePassiveModule";
import { createCritEnergyPassiveModule } from "#src/services/weapon/passives/createCritEnergyPassiveModule";
import { createCrushPassiveModule } from "#src/services/weapon/passives/createCrushPassiveModule";
import { createCullTheWeakPassiveModule } from "#src/services/weapon/passives/createCullTheWeakPassiveModule";
import { createDaylightsAuguryPassiveModule } from "#src/services/weapon/passives/createDaylightsAuguryPassiveModule";
import { createDebutPassiveModule } from "#src/services/weapon/passives/createDebutPassiveModule";
import { createDecimatePassiveModule } from "#src/services/weapon/passives/createDecimatePassiveModule";
import { createDeterminationPassiveModule } from "#src/services/weapon/passives/createDeterminationPassiveModule";
import { createEagleSpearOfJusticePassiveModule } from "#src/services/weapon/passives/createEagleSpearOfJusticePassiveModule";
import { createEchoOfAVowPassiveModule } from "#src/services/weapon/passives/createEchoOfAVowPassiveModule";
import { createEchoesOfThePlentifulLandPassiveModule } from "#src/services/weapon/passives/createEchoesOfThePlentifulLandPassiveModule";
import { createEchoingBalladPassiveModule } from "#src/services/weapon/passives/createEchoingBalladPassiveModule";
import { createElementalMasteryPassiveModule } from "#src/services/weapon/passives/createElementalMasteryPassiveModule";
import { createEssenceOfFalsityPassiveModule } from "#src/services/weapon/passives/createEssenceOfFalsityPassiveModule";
import { createFalconsDefiancePassiveModule } from "#src/services/weapon/passives/createFalconsDefiancePassiveModule";
import { createFallIntoPlacePassiveModule } from "#src/services/weapon/passives/createFallIntoPlacePassiveModule";
import { createFinaleOfTheDeepPassiveModule } from "#src/services/weapon/passives/createFinaleOfTheDeepPassiveModule";
import { createFlowerFeatherSongPassiveModule } from "#src/services/weapon/passives/createFlowerFeatherSongPassiveModule";
import { createFlowingPurityPassiveModule } from "#src/services/weapon/passives/createFlowingPurityPassiveModule";
import { createFocusPassiveModule } from "#src/services/weapon/passives/createFocusPassiveModule";
import { createFullHPCriticUpPassiveModule } from "#src/services/weapon/passives/createFullHPCriticUpPassiveModule";
import { createGashPassiveModule } from "#src/services/weapon/passives/createGashPassiveModule";
import { createGildingPassiveModule } from "#src/services/weapon/passives/createGildingPassiveModule";
import { createGokadaiouOtogibanashiPassiveModule } from "#src/services/weapon/passives/createGokadaiouOtogibanashiPassiveModule";
import { createGoldenMajestyPassiveModule } from "#src/services/weapon/passives/createGoldenMajestyPassiveModule";
import { createGuerillaTacticsPassiveModule } from "#src/services/weapon/passives/createGuerillaTacticsPassiveModule";
import { createHamayumiPassiveModule } from "#src/services/weapon/passives/createHamayumiPassiveModule";
import { createHeavyPassiveModule } from "#src/services/weapon/passives/createHeavyPassiveModule";
import { createHeritagePassiveModule } from "#src/services/weapon/passives/createHeritagePassiveModule";
import { createInfusionArrowPassiveModule } from "#src/services/weapon/passives/createInfusionArrowPassiveModule";
import { createInfusionBladePassiveModule } from "#src/services/weapon/passives/createInfusionBladePassiveModule";
import { createInfusionNeedlePassiveModule } from "#src/services/weapon/passives/createInfusionNeedlePassiveModule";
import { createInfusionScrollPassiveModule } from "#src/services/weapon/passives/createInfusionScrollPassiveModule";
import { createInfusionStingerPassiveModule } from "#src/services/weapon/passives/createInfusionStingerPassiveModule";
import { createItinerantHeroPassiveModule } from "#src/services/weapon/passives/createItinerantHeroPassiveModule";
import { createIwakuraSuccessionPassiveModule } from "#src/services/weapon/passives/createIwakuraSuccessionPassiveModule";
import { createJusticePassiveModule } from "#src/services/weapon/passives/createJusticePassiveModule";
import { createLawsEquilibriumPassiveModule } from "#src/services/weapon/passives/createLawsEquilibriumPassiveModule";
import { createMagicAffinityPassiveModule } from "#src/services/weapon/passives/createMagicAffinityPassiveModule";
import { createOathOfQhapaqNanPassiveModule } from "#src/services/weapon/passives/createOathOfQhapaqNanPassiveModule";
import { createPactOfFlowingSpringsPassiveModule } from "#src/services/weapon/passives/createPactOfFlowingSpringsPassiveModule";
import { createParticleHealPassiveModule } from "#src/services/weapon/passives/createParticleHealPassiveModule";
import { createPhantomFlashPassiveModule } from "#src/services/weapon/passives/createPhantomFlashPassiveModule";
import { createPrecisePassiveModule } from "#src/services/weapon/passives/createPrecisePassiveModule";
import { createPressTheAdvantagePassiveModule } from "#src/services/weapon/passives/createPressTheAdvantagePassiveModule";
import { createProtectorsVirtuePassiveModule } from "#src/services/weapon/passives/createProtectorsVirtuePassiveModule";
import { createReactionAttackPassiveModule } from "#src/services/weapon/passives/createReactionAttackPassiveModule";
import { createRebelliousGuardianPassiveModule } from "#src/services/weapon/passives/createRebelliousGuardianPassiveModule";
import { createRepentanceAndRedemptionPassiveModule } from "#src/services/weapon/passives/createRepentanceAndRedemptionPassiveModule";
import { createRustPassiveModule } from "#src/services/weapon/passives/createRustPassiveModule";
import { createSamuraiConductPassiveModule } from "#src/services/weapon/passives/createSamuraiConductPassiveModule";
import { createSeasonedSymphonyPassiveModule } from "#src/services/weapon/passives/createSeasonedSymphonyPassiveModule";
import { createSharpPassiveModule } from "#src/services/weapon/passives/createSharpPassiveModule";
import { createSkillAndBurstDamagePassiveModule } from "#src/services/weapon/passives/createSkillAndBurstDamagePassiveModule";
import { createSkyPiercingFangPassiveModule } from "#src/services/weapon/passives/createSkyPiercingFangPassiveModule";
import { createSkyRippingDragonSpinePassiveModule } from "#src/services/weapon/passives/createSkyRippingDragonSpinePassiveModule";
import { createSmashedStonePassiveModule } from "#src/services/weapon/passives/createSmashedStonePassiveModule";
import { createSmokeAndMirrorMysteryPassiveModule } from "#src/services/weapon/passives/createSmokeAndMirrorMysteryPassiveModule";
import { createSolemnSilencePassiveModule } from "#src/services/weapon/passives/createSolemnSilencePassiveModule";
import { createSongOfTheVigilPassiveModule } from "#src/services/weapon/passives/createSongOfTheVigilPassiveModule";
import { createSpotlessHeartPassiveModule } from "#src/services/weapon/passives/createSpotlessHeartPassiveModule";
import { createStaffOfHomaPassiveModule } from "#src/services/weapon/passives/createStaffOfHomaPassiveModule";
import { createStarfireUponTheSnowplainsPassiveModule } from "#src/services/weapon/passives/createStarfireUponTheSnowplainsPassiveModule";
import { createTheFirstGreatMagicPassiveModule } from "#src/services/weapon/passives/createTheFirstGreatMagicPassiveModule";
import { createThePartingRefrainPassiveModule } from "#src/services/weapon/passives/createThePartingRefrainPassiveModule";
import { createTidalShadowPassiveModule } from "#src/services/weapon/passives/createTidalShadowPassiveModule";
import { createTimelessDreamEternalStovePassiveModule } from "#src/services/weapon/passives/createTimelessDreamEternalStovePassiveModule";
import { createTipOfTheSpearPassiveModule } from "#src/services/weapon/passives/createTipOfTheSpearPassiveModule";
import { createTurquoiseHuntPassiveModule } from "#src/services/weapon/passives/createTurquoiseHuntPassiveModule";
import { createUnbendingPassiveModule } from "#src/services/weapon/passives/createUnbendingPassiveModule";
import { createUndyingAdmirationPassiveModule } from "#src/services/weapon/passives/createUndyingAdmirationPassiveModule";
import { createUnreturningPassiveModule } from "#src/services/weapon/passives/createUnreturningPassiveModule";
import { createWanderingCloudsPassiveModule } from "#src/services/weapon/passives/createWanderingCloudsPassiveModule";
import { createWhitemoonBristlePassiveModule } from "#src/services/weapon/passives/createWhitemoonBristlePassiveModule";
import { createWolfishTrackerPassiveModule } from "#src/services/weapon/passives/createWolfishTrackerPassiveModule";

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
        { reactionType: ReactionType.StellarConduct },
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
  // Windfall (Favonius Sword)
  "1914259": createCritEnergyPassiveModule,
  // Windfall (Favonius Greatsword)
  "2638835051": createCritEnergyPassiveModule,
  // Windfall (Favonius Lance)
  "1244741843": createCritEnergyPassiveModule,
  // Windfall (Favonius Codex)
  "2196159603": createCritEnergyPassiveModule,
  // Windfall (Favonius Warbow)
  "3964029091": createCritEnergyPassiveModule,
  // Bane of Fire and Thunder (Lion's Roar)
  "2541719715": (params) => createBaneOfElementsPassiveModule([Element.Pyro, Element.Electro], params),
  // Bane of Storm and Tide (Rainslasher)
  "3070185899": (params) => createBaneOfElementsPassiveModule([Element.Hydro, Element.Electro], params),
  // Bane of Flame and Water (Dragon's Bane)
  "2359918763": (params) => createBaneOfElementsPassiveModule([Element.Hydro, Element.Pyro], params),
  // Rust
  "3717831139": createRustPassiveModule,
  // The Stringless
  "1839966563": createSkillAndBurstDamagePassiveModule,
  // Echo (Eye of Perception)
  "2057933859": createBoltOfPerceptionPassiveModule,
  // Archer's Message (Messenger)
  "3847632939": createArchersMessagePassiveModule,
  // Composed (Sacrificial Sword)
  "2041230531": createComposedPassiveModule,
  // Composed (Sacrificial Greatsword)
  "4267154851": createComposedPassiveModule,
  // Composed (Sacrificial Fragments)
  "1971972187": createComposedPassiveModule,
  // Composed (Sacrificial Bow)
  "4136879547": createComposedPassiveModule,
  // Chord (The Flute)
  "3057490131": createChordPassiveModule,
  // Rebellious Guardian (The Bell)
  "896844259": createRebelliousGuardianPassiveModule,
  // Debut (The Widsith)
  "4145255819": createDebutPassiveModule,
  // Press the Advantage (Blackcliff Longsword)
  "3117685819": createPressTheAdvantagePassiveModule,
  // Justice (The Black Sword)
  "1092738259": createJusticePassiveModule,
  // Itinerant Hero (The Alley Flash)
  "3197835587": createItinerantHeroPassiveModule,
  // Focus (Royal Longsword)
  "2129974699": createFocusPassiveModule,
  // Undying Admiration (Festering Desire)
  "1399609651": createUndyingAdmirationPassiveModule,
  // Spotless Heart (Cinnabar Spindle)
  "1348697123": createSpotlessHeartPassiveModule,
  // Iwakura Succession (Amenoma Kageuchi)
  "2700351571": createIwakuraSuccessionPassiveModule,
  // Wolfish Tracker (Wolf's Gravestone)
  "2660534475": createWolfishTrackerPassiveModule,
  // Black Wing (Skyward Spine)
  "2421341659": createBlackWingPassiveModule,
  // Echoing Ballad (Skyward Harp)
  "2971867387": createEchoingBalladPassiveModule,
  // Falcon's Defiance (Aquila Favonia)
  "1362579531": createFalconsDefiancePassiveModule,
  // Sky-Piercing Fang (Skyward Blade)
  "2711925235": createSkyPiercingFangPassiveModule,
  // Sky-ripping Dragon Spine (Skyward Pride)
  "3265578323": createSkyRippingDragonSpinePassiveModule,
  // Wandering Clouds (Skyward Atlas)
  "2012979451": createWanderingCloudsPassiveModule,
  // Boundless Blessing (Lost Prayer to the Sacred Winds)
  "483941803": createBoundlessBlessingPassiveModule,
  // Eagle Spear of Justice (Primordial Jade Winged-Spear)
  "3835416843": createEagleSpearOfJusticePassiveModule,
  // Smoke-and-Mirror Mystery (Flute of Ezpitzal)
  "641137867": createSmokeAndMirrorMysteryPassiveModule,
  // Pact of Flowing Springs (Footprint of the Rainbow)
  "4067649747": createPactOfFlowingSpringsPassiveModule,
  // The Law's Equilibrium (Covenant of Frost and Snow)
  "1419973003": createLawsEquilibriumPassiveModule,
  // White Cruising Wave (Tidal Shadow)
  "4049199251": createTidalShadowPassiveModule,
  // Benthic Pulse (Song of Stillness)
  "369700907": createBenthicPulsePassiveModule,
  // Tip of the Spear (Rightful Reward)
  "2803637475": createTipOfTheSpearPassiveModule,
  // Fall Into Place (Master Key)
  "706623635": createFallIntoPlacePassiveModule,
  // Phantom Flash (Snare Hook)
  "3123029499": createPhantomFlashPassiveModule,
  // Solemn Silence (Serenity's Call)
  "2280400315": createSolemnSilencePassiveModule,
  // Full Draw (Hamayumi)
  "3099408603": createHamayumiPassiveModule,
  // Cadence of Days Gone By (Song of the Vigil)
  "385807483": createSongOfTheVigilPassiveModule,
  // Repentance and Redemption (Blade of Atonement)
  "2270410107": createRepentanceAndRedemptionPassiveModule,
  // An End Sublime (Finale of the Deep)
  "2548633643": createFinaleOfTheDeepPassiveModule,
  // Unfinished Masterpiece (Flowing Purity)
  "3335241819": createFlowingPurityPassiveModule,
  // Starfire Upon the Snowplains (Emberwell)
  "953016699": createStarfireUponTheSnowplainsPassiveModule,
  // Echo of a Vow (Echoes of the Heart)
  "2626267635": createEchoOfAVowPassiveModule,
  // Samurai Conduct (Kitain Cross Spear)
  "1395787867": createSamuraiConductPassiveModule,
  // Samurai Conduct (Katsuragikiri Nagamasa)
  "1828182147": createSamuraiConductPassiveModule,
  // Echoes of the Plentiful Land (Ring of Yaxche)
  "3167933899": createEchoesOfThePlentifulLandPassiveModule,
  // Flower-Feather Song (Chain Breaker)
  "4131533283": createFlowerFeatherSongPassiveModule,
  // Protector's Virtue (Primordial Jade Cutter)
  "1901402467": createProtectorsVirtuePassiveModule,
  // Timeless Dream: Eternal Stove (Engulfing Lightning)
  "2229628147": createTimelessDreamEternalStovePassiveModule,
  // Bathhouses, Hawks, and Narukami (Sunny Morning Sleep-In)
  "2260847683": createBathhousesHawksAndNarukamiPassiveModule,
  // Seasoned Symphony (Symphonist of Scents)
  "2664303051": createSeasonedSymphonyPassiveModule,
  // Essence of Falsity (Reliquary of Truth)
  "2787405899": createEssenceOfFalsityPassiveModule,
  // Reckless Cinnabar (Staff of Homa)
  "3284643059": createStaffOfHomaPassiveModule,
  // Parsifal the Great (The First Great Magic)
  "3257922883": createTheFirstGreatMagicPassiveModule,
  // Turquoise Hunt (Fang of the Mountain King)
  "3276718187": createTurquoiseHuntPassiveModule,
  // Daylight's Augury (Polar Star)
  "303626691": createDaylightsAuguryPassiveModule,
  // The Parting Refrain (Elegy for the End)
  "3170252851": createThePartingRefrainPassiveModule,
  // Golden Majesty (Vortex Vanquisher)
  "3573861603": createGoldenMajestyPassiveModule,
  // Gokadaiou Otogibanashi (Redhorn Stonethresher)
  "372854075": createGokadaiouOtogibanashiPassiveModule,
  // Whitemoon Bristle (Light of Foliar Incision)
  "2646627715": createWhitemoonBristlePassiveModule,
  // Aeon Wave (Tome of the Eternal Flow)
  "3205793275": createAeonWavePassiveModule,
  // Oath of Qhapaq Nan (Earth Shaker)
  "2824611011": createOathOfQhapaqNanPassiveModule,
};
