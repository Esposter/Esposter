import type { PassiveModule } from "#src/models/kit/PassiveModule";

import { Attribute } from "#src/models/character/Attribute";
import { ReactionType } from "#src/models/combat/ReactionType";
import { Element } from "#src/models/Element";
import { createAeonWavePassiveModule } from "#src/services/weapon/passives/createAeonWavePassiveModule";
import { createArchersMessagePassiveModule } from "#src/services/weapon/passives/createArchersMessagePassiveModule";
import { createAtTheEndOfTheBeastPathsPassiveModule } from "#src/services/weapon/passives/createAtTheEndOfTheBeastPathsPassiveModule";
import { createBaneOfElementsPassiveModule } from "#src/services/weapon/passives/createBaneOfElementsPassiveModule";
import { createBaneOfTheSoftPassiveModule } from "#src/services/weapon/passives/createBaneOfTheSoftPassiveModule";
import { createBathhousesHawksAndNarukamiPassiveModule } from "#src/services/weapon/passives/createBathhousesHawksAndNarukamiPassiveModule";
import { createBenthicPulsePassiveModule } from "#src/services/weapon/passives/createBenthicPulsePassiveModule";
import { createBlackWingPassiveModule } from "#src/services/weapon/passives/createBlackWingPassiveModule";
import { createBluntConclusionPassiveModule } from "#src/services/weapon/passives/createBluntConclusionPassiveModule";
import { createBoltOfPerceptionPassiveModule } from "#src/services/weapon/passives/createBoltOfPerceptionPassiveModule";
import { createBoundlessBlessingPassiveModule } from "#src/services/weapon/passives/createBoundlessBlessingPassiveModule";
import { createByakuyaKougetsuPassiveModule } from "#src/services/weapon/passives/createByakuyaKougetsuPassiveModule";
import { createChordPassiveModule } from "#src/services/weapon/passives/createChordPassiveModule";
import { createComposedPassiveModule } from "#src/services/weapon/passives/createComposedPassiveModule";
import { createCouragePassiveModule } from "#src/services/weapon/passives/createCouragePassiveModule";
import { createCritEnergyPassiveModule } from "#src/services/weapon/passives/createCritEnergyPassiveModule";
import { createCrownOfTheFinalScionPassiveModule } from "#src/services/weapon/passives/createCrownOfTheFinalScionPassiveModule";
import { createCrushPassiveModule } from "#src/services/weapon/passives/createCrushPassiveModule";
import { createCullTheWeakPassiveModule } from "#src/services/weapon/passives/createCullTheWeakPassiveModule";
import { createDaylightsAuguryPassiveModule } from "#src/services/weapon/passives/createDaylightsAuguryPassiveModule";
import { createDeathlyPactPassiveModule } from "#src/services/weapon/passives/createDeathlyPactPassiveModule";
import { createDebutPassiveModule } from "#src/services/weapon/passives/createDebutPassiveModule";
import { createDecimatePassiveModule } from "#src/services/weapon/passives/createDecimatePassiveModule";
import { createDeterminationPassiveModule } from "#src/services/weapon/passives/createDeterminationPassiveModule";
import { createDiffusingBoundaryPassiveModule } from "#src/services/weapon/passives/createDiffusingBoundaryPassiveModule";
import { createDodocoTalesPassiveModule } from "#src/services/weapon/passives/createDodocoTalesPassiveModule";
import { createDolorousStrokePassiveModule } from "#src/services/weapon/passives/createDolorousStrokePassiveModule";
import { createEagleSpearOfJusticePassiveModule } from "#src/services/weapon/passives/createEagleSpearOfJusticePassiveModule";
import { createEchoesOfThePlentifulLandPassiveModule } from "#src/services/weapon/passives/createEchoesOfThePlentifulLandPassiveModule";
import { createEchoingBalladPassiveModule } from "#src/services/weapon/passives/createEchoingBalladPassiveModule";
import { createEchoOfAVowPassiveModule } from "#src/services/weapon/passives/createEchoOfAVowPassiveModule";
import { createElementalMasteryPassiveModule } from "#src/services/weapon/passives/createElementalMasteryPassiveModule";
import { createEssenceOfFalsityPassiveModule } from "#src/services/weapon/passives/createEssenceOfFalsityPassiveModule";
import { createEvernightDuetPassiveModule } from "#src/services/weapon/passives/createEvernightDuetPassiveModule";
import { createExtinguishingPreceptPassiveModule } from "#src/services/weapon/passives/createExtinguishingPreceptPassiveModule";
import { createFalconsDefiancePassiveModule } from "#src/services/weapon/passives/createFalconsDefiancePassiveModule";
import { createFallIntoPlacePassiveModule } from "#src/services/weapon/passives/createFallIntoPlacePassiveModule";
import { createFangsFlyingToAndFroPassiveModule } from "#src/services/weapon/passives/createFangsFlyingToAndFroPassiveModule";
import { createFinaleOfTheDeepPassiveModule } from "#src/services/weapon/passives/createFinaleOfTheDeepPassiveModule";
import { createFlowerFeatherSongPassiveModule } from "#src/services/weapon/passives/createFlowerFeatherSongPassiveModule";
import { createFlowingPurityPassiveModule } from "#src/services/weapon/passives/createFlowingPurityPassiveModule";
import { createFocusPassiveModule } from "#src/services/weapon/passives/createFocusPassiveModule";
import { createFrostBurialPassiveModule } from "#src/services/weapon/passives/createFrostBurialPassiveModule";
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
import { createIronbonePassiveModule } from "#src/services/weapon/passives/createIronbonePassiveModule";
import { createItinerantHeroPassiveModule } from "#src/services/weapon/passives/createItinerantHeroPassiveModule";
import { createIwakuraSuccessionPassiveModule } from "#src/services/weapon/passives/createIwakuraSuccessionPassiveModule";
import { createJusticePassiveModule } from "#src/services/weapon/passives/createJusticePassiveModule";
import { createKaguraDanceOfTheSacredSakuraPassiveModule } from "#src/services/weapon/passives/createKaguraDanceOfTheSacredSakuraPassiveModule";
import { createLabyrinthLordsInstructionPassiveModule } from "#src/services/weapon/passives/createLabyrinthLordsInstructionPassiveModule";
import { createLawsEquilibriumPassiveModule } from "#src/services/weapon/passives/createLawsEquilibriumPassiveModule";
import { createLegacyOfLangGanPassiveModule } from "#src/services/weapon/passives/createLegacyOfLangGanPassiveModule";
import { createMagicAffinityPassiveModule } from "#src/services/weapon/passives/createMagicAffinityPassiveModule";
import { createManyOathsOfDawnAndDuskPassiveModule } from "#src/services/weapon/passives/createManyOathsOfDawnAndDuskPassiveModule";
import { createMournfulTributePassiveModule } from "#src/services/weapon/passives/createMournfulTributePassiveModule";
import { createNocturnalDreamsPassiveModule } from "#src/services/weapon/passives/createNocturnalDreamsPassiveModule";
import { createOathOfQhapaqNanPassiveModule } from "#src/services/weapon/passives/createOathOfQhapaqNanPassiveModule";
import { createOceanicVictoryPassiveModule } from "#src/services/weapon/passives/createOceanicVictoryPassiveModule";
import { createOfferingUntoWindAndSunPassiveModule } from "#src/services/weapon/passives/createOfferingUntoWindAndSunPassiveModule";
import { createPactOfFlowingSpringsPassiveModule } from "#src/services/weapon/passives/createPactOfFlowingSpringsPassiveModule";
import { createParticleHealPassiveModule } from "#src/services/weapon/passives/createParticleHealPassiveModule";
import { createPhantomFlashPassiveModule } from "#src/services/weapon/passives/createPhantomFlashPassiveModule";
import { createPrecisePassiveModule } from "#src/services/weapon/passives/createPrecisePassiveModule";
import { createPressTheAdvantagePassiveModule } from "#src/services/weapon/passives/createPressTheAdvantagePassiveModule";
import { createPrimordialJadeRegaliaPassiveModule } from "#src/services/weapon/passives/createPrimordialJadeRegaliaPassiveModule";
import { createProtectorsVirtuePassiveModule } from "#src/services/weapon/passives/createProtectorsVirtuePassiveModule";
import { createPurifyingCrownPassiveModule } from "#src/services/weapon/passives/createPurifyingCrownPassiveModule";
import { createRadianceOnTheWaterPassiveModule } from "#src/services/weapon/passives/createRadianceOnTheWaterPassiveModule";
import { createReactionAttackPassiveModule } from "#src/services/weapon/passives/createReactionAttackPassiveModule";
import { createRebelliousGuardianPassiveModule } from "#src/services/weapon/passives/createRebelliousGuardianPassiveModule";
import { createRepentanceAndRedemptionPassiveModule } from "#src/services/weapon/passives/createRepentanceAndRedemptionPassiveModule";
import { createRustPassiveModule } from "#src/services/weapon/passives/createRustPassiveModule";
import { createSamuraiConductPassiveModule } from "#src/services/weapon/passives/createSamuraiConductPassiveModule";
import { createSeasonedSymphonyPassiveModule } from "#src/services/weapon/passives/createSeasonedSymphonyPassiveModule";
import { createSecretWisdomsFavorPassiveModule } from "#src/services/weapon/passives/createSecretWisdomsFavorPassiveModule";
import { createSharpPassiveModule } from "#src/services/weapon/passives/createSharpPassiveModule";
import { createSkillAndBurstDamagePassiveModule } from "#src/services/weapon/passives/createSkillAndBurstDamagePassiveModule";
import { createSkillBuffPassiveModule } from "#src/services/weapon/passives/createSkillBuffPassiveModule";
import { createSkyPiercingFangPassiveModule } from "#src/services/weapon/passives/createSkyPiercingFangPassiveModule";
import { createSkyRippingDragonSpinePassiveModule } from "#src/services/weapon/passives/createSkyRippingDragonSpinePassiveModule";
import { createSmashedStonePassiveModule } from "#src/services/weapon/passives/createSmashedStonePassiveModule";
import { createSmokeAndMirrorMysteryPassiveModule } from "#src/services/weapon/passives/createSmokeAndMirrorMysteryPassiveModule";
import { createSolemnSilencePassiveModule } from "#src/services/weapon/passives/createSolemnSilencePassiveModule";
import { createSongOfTheVigilPassiveModule } from "#src/services/weapon/passives/createSongOfTheVigilPassiveModule";
import { createSpotlessHeartPassiveModule } from "#src/services/weapon/passives/createSpotlessHeartPassiveModule";
import { createStaffOfHomaPassiveModule } from "#src/services/weapon/passives/createStaffOfHomaPassiveModule";
import { createStarfireUponTheSnowplainsPassiveModule } from "#src/services/weapon/passives/createStarfireUponTheSnowplainsPassiveModule";
import { createSunkenSongOfTheSandsPassiveModule } from "#src/services/weapon/passives/createSunkenSongOfTheSandsPassiveModule";
import { createSunsetReignitesTheDawnPassiveModule } from "#src/services/weapon/passives/createSunsetReignitesTheDawnPassiveModule";
import { createTheFirstGreatMagicPassiveModule } from "#src/services/weapon/passives/createTheFirstGreatMagicPassiveModule";
import { createThePartingRefrainPassiveModule } from "#src/services/weapon/passives/createThePartingRefrainPassiveModule";
import { createTidalShadowPassiveModule } from "#src/services/weapon/passives/createTidalShadowPassiveModule";
import { createTimelessDreamEternalStovePassiveModule } from "#src/services/weapon/passives/createTimelessDreamEternalStovePassiveModule";
import { createTipOfTheSpearPassiveModule } from "#src/services/weapon/passives/createTipOfTheSpearPassiveModule";
import { createTravelersPathPassiveModule } from "#src/services/weapon/passives/createTravelersPathPassiveModule";
import { createTurquoiseHuntPassiveModule } from "#src/services/weapon/passives/createTurquoiseHuntPassiveModule";
import { createUnbendingPassiveModule } from "#src/services/weapon/passives/createUnbendingPassiveModule";
import { createUndyingAdmirationPassiveModule } from "#src/services/weapon/passives/createUndyingAdmirationPassiveModule";
import { createUnreturningPassiveModule } from "#src/services/weapon/passives/createUnreturningPassiveModule";
import { createWanderingCloudsPassiveModule } from "#src/services/weapon/passives/createWanderingCloudsPassiveModule";
import { createWhitehillsBestowalPassiveModule } from "#src/services/weapon/passives/createWhitehillsBestowalPassiveModule";
import { createWhitemoonBristlePassiveModule } from "#src/services/weapon/passives/createWhitemoonBristlePassiveModule";
import { createWithoutHeedForDayNorNightPassiveModule } from "#src/services/weapon/passives/createWithoutHeedForDayNorNightPassiveModule";
import { createWolfishTrackerPassiveModule } from "#src/services/weapon/passives/createWolfishTrackerPassiveModule";

// The Bane passives' modules, one named lambda per element pair, so each weapon carrying a pair shares its module
const createBaneOfWaterAndIcePassiveModule = (params: number[]): PassiveModule =>
  createBaneOfElementsPassiveModule([Element.Hydro, Element.Cryo], params);
const createBaneOfFireAndThunderPassiveModule = (params: number[]): PassiveModule =>
  createBaneOfElementsPassiveModule([Element.Pyro, Element.Electro], params);
const createBaneOfStormAndTidePassiveModule = (params: number[]): PassiveModule =>
  createBaneOfElementsPassiveModule([Element.Hydro, Element.Electro], params);
const createBaneOfFlameAndWaterPassiveModule = (params: number[]): PassiveModule =>
  createBaneOfElementsPassiveModule([Element.Hydro, Element.Pyro], params);

// Each passive whose module is built, by the text id of its name, which a weapon's record holds, so a weapon's passive is
// Found by the name its table gives it. A passive with no module here gives its wielder nothing
export const WeaponPassiveNameTextIdCreateModuleMap: Readonly<
  Partial<Record<string, (params: number[]) => PassiveModule>>
> = {
  // Windfall (Favonius Sword)
  "1914259": createCritEnergyPassiveModule,
  // Determination
  "94261419": createDeterminationPassiveModule,
  // Unbending
  "99463579": createUnbendingPassiveModule,
  // Heritage
  "110253283": createHeritagePassiveModule,
  // Extinguishing Precept (Calamity Queller)
  "131958235": createExtinguishingPreceptPassiveModule,
  // Decimate
  "174540131": createDecimatePassiveModule,
  // Daylight's Augury (Polar Star)
  "303626691": createDaylightsAuguryPassiveModule,
  // Benthic Pulse (Song of Stillness)
  "369700907": createBenthicPulsePassiveModule,
  // Gokadaiou Otogibanashi (Redhorn Stonethresher)
  "372854075": createGokadaiouOtogibanashiPassiveModule,
  // Cadence of Days Gone By (Song of the Vigil)
  "385807483": createSongOfTheVigilPassiveModule,
  // Without Heed for Day nor Night (Clash of Kings)
  "407790963": createWithoutHeedForDayNorNightPassiveModule,
  // Boundless Blessing (Lost Prayer to the Sacred Winds)
  "483941803": createBoundlessBlessingPassiveModule,
  // Frost Burial (Snow-Tombed Starsilver, Dragonspine Spear, Frostbearer)
  "486943795": createFrostBurialPassiveModule,
  // Bane of Water and Ice
  "523615731": createBaneOfWaterAndIcePassiveModule,
  // Smoke-and-Mirror Mystery (Flute of Ezpitzal)
  "641137867": createSmokeAndMirrorMysteryPassiveModule,
  // Offering Unto Wind and Sun (Starcaller's Watch)
  "646104387": createOfferingUntoWindAndSunPassiveModule,
  // Golden Majesty (Summit Shaper, The Unforged, Memory of Dust), the same passive under text ids of their own
  "649271795": createGoldenMajestyPassiveModule,
  // Bane of the Soft
  "651784635": createBaneOfTheSoftPassiveModule,
  // Fall Into Place (Master Key)
  "706623635": createFallIntoPlacePassiveModule,
  // Magic Affinity
  "734556419": createMagicAffinityPassiveModule,
  // Crown of the Final Scion (Angelos' Heptades)
  "788659619": createCrownOfTheFinalScionPassiveModule,
  // Mournful Tribute (Bloodsoaked Ruins)
  "867694867": createMournfulTributePassiveModule,
  // Rebellious Guardian (The Bell)
  "896844259": createRebelliousGuardianPassiveModule,
  // Focus (Royal Grimoire)
  "916503587": createFocusPassiveModule,
  // Starfire Upon the Snowplains (Emberwell)
  "953016699": createStarfireUponTheSnowplainsPassiveModule,
  // Oceanic Victory (Luxurious Sea-Lord)
  "1016634707": createOceanicVictoryPassiveModule,
  // Traveler's Path (Exaiphanes Blade)
  "1043198987": createTravelersPathPassiveModule,
  // Sunken Song of the Sands (Key of Khaj-Nisut)
  "1054220683": createSunkenSongOfTheSandsPassiveModule,
  // Justice (The Black Sword)
  "1092738259": createJusticePassiveModule,
  // Unreturning
  "1166144531": createUnreturningPassiveModule,
  // Busybody's Running Light (Tamayuratei no Ohanashi)
  "1169232075": (params) =>
    createSkillBuffPassiveModule(params, {
      attributes: [Attribute.AttackPercent, Attribute.MovementSpeed],
      source: "busybodysRunningLight",
    }),
  // At the End of the Beast-Paths (Hunter's Path)
  "1173973395": createAtTheEndOfTheBeastPathsPassiveModule,
  // Windfall (Favonius Lance)
  "1244741843": createCritEnergyPassiveModule,
  // Byakuya Kougetsu (Everlasting Moonglow)
  "1301139739": createByakuyaKougetsuPassiveModule,
  "1340415043": createFrostBurialPassiveModule,
  // Spotless Heart (Cinnabar Spindle)
  "1348697123": createSpotlessHeartPassiveModule,
  // Falcon's Defiance (Aquila Favonia)
  "1362579531": createFalconsDefiancePassiveModule,
  // Heavy
  "1364561971": createHeavyPassiveModule,
  // Gilding
  "1373283795": createGildingPassiveModule,
  // Samurai Conduct (Kitain Cross Spear)
  "1395787867": createSamuraiConductPassiveModule,
  // Undying Admiration (Festering Desire)
  "1399609651": createUndyingAdmirationPassiveModule,
  "1405856115": createGoldenMajestyPassiveModule,
  // The Law's Equilibrium (Covenant of Frost and Snow)
  "1419973003": createLawsEquilibriumPassiveModule,
  // Press the Advantage (Blackcliff Warbow)
  "1421912251": createPressTheAdvantagePassiveModule,
  // Nocturnal Dreams (Dawning Frost)
  "1658621971": createNocturnalDreamsPassiveModule,
  // Infusion Scroll
  "1663313163": createInfusionScrollPassiveModule,
  // Whitehill's Bestowal (Azurelight)
  "1741516147": createWhitehillsBestowalPassiveModule,
  // Press the Advantage (Blackcliff Agate)
  "1776215435": createPressTheAdvantagePassiveModule,
  // Samurai Conduct (Katsuragikiri Nagamasa)
  "1828182147": createSamuraiConductPassiveModule,
  // The Stringless
  "1839966563": createSkillAndBurstDamagePassiveModule,
  // Precise
  "1849455683": createPrecisePassiveModule,
  // Infusion Needle
  "1859047483": createInfusionNeedlePassiveModule,
  // Protector's Virtue (Primordial Jade Cutter)
  "1901402467": createProtectorsVirtuePassiveModule,
  // Elemental Mastery
  "1944680691": createElementalMasteryPassiveModule,
  // Bane of Flame and Water
  "1958685971": createBaneOfFlameAndWaterPassiveModule,
  // Focus (Royal Spear)
  "1960420595": createFocusPassiveModule,
  // Composed (Sacrificial Fragments)
  "1971972187": createComposedPassiveModule,
  // Fangs Flying To and Fro (Waveriding Whirl)
  "2004975019": createFangsFlyingToAndFroPassiveModule,
  // Wandering Clouds (Skyward Atlas)
  "2012979451": createWanderingCloudsPassiveModule,
  // Composed (Sacrificial Sword)
  "2041230531": createComposedPassiveModule,
  // Deathly Pact (Absolution)
  "2056241443": createDeathlyPactPassiveModule,
  // Echo (Eye of Perception)
  "2057933859": createBoltOfPerceptionPassiveModule,
  // Bane of Fire and Thunder
  "2101250155": createBaneOfFireAndThunderPassiveModule,
  // Focus (Royal Longsword)
  "2129974699": createFocusPassiveModule,
  // Focus (Royal Bow)
  "2136204531": createFocusPassiveModule,
  // Windfall (Favonius Codex)
  "2196159603": createCritEnergyPassiveModule,
  // Timeless Dream: Eternal Stove (Engulfing Lightning)
  "2229628147": createTimelessDreamEternalStovePassiveModule,
  // Windblume Wish (Windblume Ode)
  "2243731691": (params) =>
    createSkillBuffPassiveModule(params, { attributes: [Attribute.AttackPercent], source: "windblumeWish" }),
  "2253836555": createGoldenMajestyPassiveModule,
  // People of the Faltering Light (Oathsworn Eye)
  "2254346691": (params) =>
    createSkillBuffPassiveModule(params, {
      attributes: [Attribute.EnergyRecharge],
      source: "peopleOfTheFalteringLight",
    }),
  // Bathhouses, Hawks, and Narukami (Sunny Morning Sleep-In)
  "2260847683": createBathhousesHawksAndNarukamiPassiveModule,
  // Repentance and Redemption (Blade of Atonement)
  "2270410107": createRepentanceAndRedemptionPassiveModule,
  // Blunt Conclusion
  "2276876379": createBluntConclusionPassiveModule,
  // Solemn Silence (Serenity's Call)
  "2280400315": createSolemnSilencePassiveModule,
  // Infusion Blade
  "2323524931": createInfusionBladePassiveModule,
  // Bane of Flame and Water (Dragon's Bane)
  "2359918763": createBaneOfFlameAndWaterPassiveModule,
  // Many Oaths of Dawn and Dusk (Verdict)
  "2378883547": createManyOathsOfDawnAndDuskPassiveModule,
  // Black Wing (Skyward Spine)
  "2421341659": createBlackWingPassiveModule,
  // Crush
  "2430074939": createCrushPassiveModule,
  // Energy Shower
  "2433054179": createParticleHealPassiveModule,
  "2459894187": createFrostBurialPassiveModule,
  // Cull the Weak (White Iron Greatsword)
  "2479230075": createCullTheWeakPassiveModule,
  // Smashed Stone
  "2507863163": createSmashedStonePassiveModule,
  // Bane of Fire and Thunder (Lion's Roar)
  "2541719715": createBaneOfFireAndThunderPassiveModule,
  // An End Sublime (Finale of the Deep)
  "2548633643": createFinaleOfTheDeepPassiveModule,
  // Press the Advantage (Blackcliff Slasher)
  "2584261683": createPressTheAdvantagePassiveModule,
  // Primordial Jade Regalia (Jadefall's Splendor)
  "2612600955": createPrimordialJadeRegaliaPassiveModule,
  // Bane of Storm and Tide
  "2612787355": createBaneOfStormAndTidePassiveModule,
  // Guerilla Tactics
  "2615715275": createGuerillaTacticsPassiveModule,
  // Echo of a Vow (Echoes of the Heart)
  "2626267635": createEchoOfAVowPassiveModule,
  // Windfall (Favonius Greatsword)
  "2638835051": createCritEnergyPassiveModule,
  // Whitemoon Bristle (Light of Foliar Incision)
  "2646627715": createWhitemoonBristlePassiveModule,
  // Wolfish Tracker (Wolf's Gravestone)
  "2660534475": createWolfishTrackerPassiveModule,
  // Seasoned Symphony (Symphonist of Scents)
  "2664303051": createSeasonedSymphonyPassiveModule,
  // Iwakura Succession (Amenoma Kageuchi)
  "2700351571": createIwakuraSuccessionPassiveModule,
  // Sky-Piercing Fang (Skyward Blade)
  "2711925235": createSkyPiercingFangPassiveModule,
  // Labyrinth Lord's Instruction (King's Squire)
  "2741602795": createLabyrinthLordsInstructionPassiveModule,
  // Focus (Royal Greatsword)
  "2759911603": createFocusPassiveModule,
  // Essence of Falsity (Reliquary of Truth)
  "2787405899": createEssenceOfFalsityPassiveModule,
  // Tip of the Spear (Rightful Reward)
  "2803637475": createTipOfTheSpearPassiveModule,
  // Oath of Qhapaq Nan (Earth Shaker)
  "2824611011": createOathOfQhapaqNanPassiveModule,
  // Infusion Arrow
  "2843293987": createInfusionArrowPassiveModule,
  // Full HP Critic Up
  "2866125259": createFullHPCriticUpPassiveModule,
  // Last Singer (Etherlight Spindlelute)
  "2931799059": (params) =>
    createSkillBuffPassiveModule(params, { attributes: [Attribute.ElementalMastery], source: "lastSinger" }),
  // Cull the Weak (The Flagstaff; its name text is TBD in the dump)
  "2951249275": createCullTheWeakPassiveModule,
  // Echoing Ballad (Skyward Harp)
  "2971867387": createEchoingBalladPassiveModule,
  // Diffusing Boundary (Calamity of Eshu)
  "2988769779": createDiffusingBoundaryPassiveModule,
  // Chord (The Flute)
  "3057490131": createChordPassiveModule,
  // Bane of Storm and Tide (Rainslasher)
  "3070185899": createBaneOfStormAndTidePassiveModule,
  // Full Draw (Hamayumi)
  "3099408603": createHamayumiPassiveModule,
  // Purifying Crown (Fractured Halo)
  "3108076563": createPurifyingCrownPassiveModule,
  // Press the Advantage (Blackcliff Longsword)
  "3117685819": createPressTheAdvantagePassiveModule,
  // Phantom Flash (Snare Hook)
  "3123029499": createPhantomFlashPassiveModule,
  // Ironbone (Fleuve Cendre Ferryman)
  "3150572971": createIronbonePassiveModule,
  // Echoes of the Plentiful Land (Ring of Yaxche)
  "3167933899": createEchoesOfThePlentifulLandPassiveModule,
  // The Parting Refrain (Elegy for the End)
  "3170252851": createThePartingRefrainPassiveModule,
  // Courage
  "3197151587": createCouragePassiveModule,
  // Itinerant Hero (The Alley Flash)
  "3197835587": createItinerantHeroPassiveModule,
  // Aeon Wave (Tome of the Eternal Flow)
  "3205793275": createAeonWavePassiveModule,
  // Infusion Stinger
  "3208149443": createInfusionStingerPassiveModule,
  // Parsifal the Great (The First Great Magic)
  "3257922883": createTheFirstGreatMagicPassiveModule,
  // Sky-ripping Dragon Spine (Skyward Pride)
  "3265578323": createSkyRippingDragonSpinePassiveModule,
  // Turquoise Hunt (Fang of the Mountain King)
  "3276718187": createTurquoiseHuntPassiveModule,
  // Reckless Cinnabar (Staff of Homa)
  "3284643059": createStaffOfHomaPassiveModule,
  // Unfinished Masterpiece (Flowing Purity)
  "3335241819": createFlowingPurityPassiveModule,
  // Gash
  "3397833923": createGashPassiveModule,
  // Golden Majesty (Vortex Vanquisher)
  "3573861603": createGoldenMajestyPassiveModule,
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
  // Cull the Weak (Recurve Bow)
  "3707047091": createCullTheWeakPassiveModule,
  // Rust
  "3717831139": createRustPassiveModule,
  // Evernight Duet (Mitternachts Waltz)
  "3737766939": createEvernightDuetPassiveModule,
  // Dolorous Stroke (Disaster and Remorse)
  "3742127275": createDolorousStrokePassiveModule,
  // Radiance on the Water (Silver Light)
  "3814375507": createRadianceOnTheWaterPassiveModule,
  // Eagle Spear of Justice (Primordial Jade Winged-Spear)
  "3835416843": createEagleSpearOfJusticePassiveModule,
  // Dodoventure! (Dodoco Tales)
  "3845860483": createDodocoTalesPassiveModule,
  // Archer's Message (Messenger)
  "3847632939": createArchersMessagePassiveModule,
  // Legacy of Lang-Gan (Lightbearing Moonshard)
  "3882258923": createLegacyOfLangGanPassiveModule,
  // Kagura Dance of the Sacred Sakura (Kagura's Verity)
  "3901432203": createKaguraDanceOfTheSacredSakuraPassiveModule,
  // Sunset Reignites the Dawn (A Thousand Blazing Suns)
  "3945977923": createSunsetReignitesTheDawnPassiveModule,
  // Windfall (Favonius Warbow)
  "3964029091": createCritEnergyPassiveModule,
  // Journey
  "3982568907": createParticleHealPassiveModule,
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
  // White Cruising Wave (Tidal Shadow)
  "4049199251": createTidalShadowPassiveModule,
  // Sharp
  "4054406475": createSharpPassiveModule,
  // Pact of Flowing Springs (Footprint of the Rainbow)
  "4067649747": createPactOfFlowingSpringsPassiveModule,
  // Flower-Feather Song (Chain Breaker)
  "4131533283": createFlowerFeatherSongPassiveModule,
  // Composed (Sacrificial Bow)
  "4136879547": createComposedPassiveModule,
  // Debut (The Widsith)
  "4145255819": createDebutPassiveModule,
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
  // Press the Advantage (Blackcliff Pole)
  "4236194011": createPressTheAdvantagePassiveModule,
  // Composed (Sacrificial Greatsword)
  "4267154851": createComposedPassiveModule,
  // Secret Wisdom's Favor (Ibis Piercer)
  "4279279011": createSecretWisdomsFavorPassiveModule,
};
