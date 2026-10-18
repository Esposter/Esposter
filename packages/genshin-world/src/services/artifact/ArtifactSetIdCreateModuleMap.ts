import type { ArtifactSetBonus } from "#src/models/artifact/ArtifactSetBonus";
import type { PassiveModule } from "#src/models/kit/PassiveModule";

import {
  ADVENTURER_ARTIFACT_SET_ID,
  AUBADE_OF_MORNINGSTAR_AND_MOON_ARTIFACT_SET_ID,
  BERSERKER_ARTIFACT_SET_ID,
  BLIZZARD_STRAYER_ARTIFACT_SET_ID,
  BLOODSTAINED_CHIVALRY_ARTIFACT_SET_ID,
  BRAVE_HEART_ARTIFACT_SET_ID,
  CRIMSON_WITCH_ARTIFACT_SET_ID,
  DEEPWOOD_MEMORIES_ARTIFACT_SET_ID,
  DEFENDERS_WILL_ARTIFACT_SET_ID,
  DESERT_PAVILION_CHRONICLE_ARTIFACT_SET_ID,
  DISENCHANTMENT_IN_DEEP_SHADOW_ARTIFACT_SET_ID,
  ECHOES_OF_AN_OFFERING_ARTIFACT_SET_ID,
  EMBLEM_OF_SEVERED_FATE_ARTIFACT_SET_ID,
  EXILE_ARTIFACT_SET_ID,
  FINALE_OF_THE_DEEP_GALLERIES_ARTIFACT_SET_ID,
  FLOWER_OF_PARADISE_LOST_ARTIFACT_SET_ID,
  GAMBLER_ARTIFACT_SET_ID,
  GILDED_DREAMS_ARTIFACT_SET_ID,
  GLADIATORS_FINALE_ARTIFACT_SET_ID,
  GOLDEN_TROUPE_ARTIFACT_SET_ID,
  HEART_OF_DEPTH_ARTIFACT_SET_ID,
  HUSK_OF_OPULENT_DREAMS_ARTIFACT_SET_ID,
  INSTRUCTOR_ARTIFACT_SET_ID,
  LAVAWALKER_ARTIFACT_SET_ID,
  LONG_NIGHTS_OATH_ARTIFACT_SET_ID,
  LUCKY_DOG_ARTIFACT_SET_ID,
  MAIDEN_BELOVED_ARTIFACT_SET_ID,
  MARECHAUSSEE_HUNTER_ARTIFACT_SET_ID,
  MARTIAL_ARTIST_ARTIFACT_SET_ID,
  MIRRORED_NYMPH_ARTIFACT_SET_ID,
  NIGHT_OF_THE_SKYS_UNVEILING_ARTIFACT_SET_ID,
  NOBLESSE_OBLIGE_ARTIFACT_SET_ID,
  OBSIDIAN_CODEX_ARTIFACT_SET_ID,
  OCEAN_HUED_CLAM_ARTIFACT_SET_ID,
  PALE_FLAME_ARTIFACT_SET_ID,
  RESOLUTION_OF_SOJOURNER_ARTIFACT_SET_ID,
  RETRACING_BOLIDE_ARTIFACT_SET_ID,
  SCARLETPROOF_ARTIFACT_SET_ID,
  SCHOLAR_ARTIFACT_SET_ID,
  SHIMENAWAS_REMINISCENCE_ARTIFACT_SET_ID,
  SILKEN_MOON_SERENADE_ARTIFACT_SET_ID,
  SONG_OF_DAYS_PAST_ARTIFACT_SET_ID,
  TENACITY_OF_THE_MILLELITH_ARTIFACT_SET_ID,
  THUNDERING_FURY_ARTIFACT_SET_ID,
  THUNDERSOOTER_ARTIFACT_SET_ID,
  TRAVELING_DOCTOR_ARTIFACT_SET_ID,
  VERMILLION_HEREAFTER_ARTIFACT_SET_ID,
  VIRIDESCENT_VENERER_ARTIFACT_SET_ID,
  VOURUKASHAS_GLOW_ARTIFACT_SET_ID,
  WANDERERS_TROUPE_ARTIFACT_SET_ID,
} from "#src/services/artifact/constants";
import { createAdventurerSetModule } from "#src/services/artifact/sets/createAdventurerSetModule";
import { createAubadeOfMorningstarAndMoonSetModule } from "#src/services/artifact/sets/createAubadeOfMorningstarAndMoonSetModule";
import { createBerserkerSetModule } from "#src/services/artifact/sets/createBerserkerSetModule";
import { createBlizzardStrayerSetModule } from "#src/services/artifact/sets/createBlizzardStrayerSetModule";
import { createBloodstainedChivalrySetModule } from "#src/services/artifact/sets/createBloodstainedChivalrySetModule";
import { createBraveHeartSetModule } from "#src/services/artifact/sets/createBraveHeartSetModule";
import { createCrimsonWitchSetModule } from "#src/services/artifact/sets/createCrimsonWitchSetModule";
import { createDeepwoodMemoriesSetModule } from "#src/services/artifact/sets/createDeepwoodMemoriesSetModule";
import { createDefendersWillSetModule } from "#src/services/artifact/sets/createDefendersWillSetModule";
import { createDesertPavilionChronicleSetModule } from "#src/services/artifact/sets/createDesertPavilionChronicleSetModule";
import { createDisenchantmentInDeepShadowSetModule } from "#src/services/artifact/sets/createDisenchantmentInDeepShadowSetModule";
import { createEchoesOfAnOfferingSetModule } from "#src/services/artifact/sets/createEchoesOfAnOfferingSetModule";
import { createEmblemOfSeveredFateSetModule } from "#src/services/artifact/sets/createEmblemOfSeveredFateSetModule";
import { createExileSetModule } from "#src/services/artifact/sets/createExileSetModule";
import { createFinaleOfTheDeepGalleriesSetModule } from "#src/services/artifact/sets/createFinaleOfTheDeepGalleriesSetModule";
import { createFlowerOfParadiseLostSetModule } from "#src/services/artifact/sets/createFlowerOfParadiseLostSetModule";
import { createGamblerSetModule } from "#src/services/artifact/sets/createGamblerSetModule";
import { createGildedDreamsSetModule } from "#src/services/artifact/sets/createGildedDreamsSetModule";
import { createGladiatorsFinaleSetModule } from "#src/services/artifact/sets/createGladiatorsFinaleSetModule";
import { createGoldenTroupeSetModule } from "#src/services/artifact/sets/createGoldenTroupeSetModule";
import { createHeartOfDepthSetModule } from "#src/services/artifact/sets/createHeartOfDepthSetModule";
import { createHuskOfOpulentDreamsSetModule } from "#src/services/artifact/sets/createHuskOfOpulentDreamsSetModule";
import { createInstructorSetModule } from "#src/services/artifact/sets/createInstructorSetModule";
import { createLavawalkerSetModule } from "#src/services/artifact/sets/createLavawalkerSetModule";
import { createLongNightsOathSetModule } from "#src/services/artifact/sets/createLongNightsOathSetModule";
import { createLuckyDogSetModule } from "#src/services/artifact/sets/createLuckyDogSetModule";
import { createMaidenBelovedSetModule } from "#src/services/artifact/sets/createMaidenBelovedSetModule";
import { createMarechausseeHunterSetModule } from "#src/services/artifact/sets/createMarechausseeHunterSetModule";
import { createMartialArtistSetModule } from "#src/services/artifact/sets/createMartialArtistSetModule";
import { createMirroredNymphSetModule } from "#src/services/artifact/sets/createMirroredNymphSetModule";
import { createNightOfTheSkysUnveilingSetModule } from "#src/services/artifact/sets/createNightOfTheSkysUnveilingSetModule";
import { createNoblesseObligeSetModule } from "#src/services/artifact/sets/createNoblesseObligeSetModule";
import { createObsidianCodexSetModule } from "#src/services/artifact/sets/createObsidianCodexSetModule";
import { createOceanHuedClamSetModule } from "#src/services/artifact/sets/createOceanHuedClamSetModule";
import { createPaleFlameSetModule } from "#src/services/artifact/sets/createPaleFlameSetModule";
import { createResolutionOfSojournerSetModule } from "#src/services/artifact/sets/createResolutionOfSojournerSetModule";
import { createRetracingBolideSetModule } from "#src/services/artifact/sets/createRetracingBolideSetModule";
import { createScarletproofSetModule } from "#src/services/artifact/sets/createScarletproofSetModule";
import { createScholarSetModule } from "#src/services/artifact/sets/createScholarSetModule";
import { createShimenawasReminiscenceSetModule } from "#src/services/artifact/sets/createShimenawasReminiscenceSetModule";
import { createSilkenMoonsSerenadeSetModule } from "#src/services/artifact/sets/createSilkenMoonsSerenadeSetModule";
import { createSongOfDaysPastSetModule } from "#src/services/artifact/sets/createSongOfDaysPastSetModule";
import { createTenacityOfTheMillelithSetModule } from "#src/services/artifact/sets/createTenacityOfTheMillelithSetModule";
import { createThunderingFurySetModule } from "#src/services/artifact/sets/createThunderingFurySetModule";
import { createThundersooterSetModule } from "#src/services/artifact/sets/createThundersooterSetModule";
import { createTravelingDoctorSetModule } from "#src/services/artifact/sets/createTravelingDoctorSetModule";
import { createVermillionHereafterSetModule } from "#src/services/artifact/sets/createVermillionHereafterSetModule";
import { createViridescentVenererSetModule } from "#src/services/artifact/sets/createViridescentVenererSetModule";
import { createVourukashasGlowSetModule } from "#src/services/artifact/sets/createVourukashasGlowSetModule";
import { createWanderersTroupeSetModule } from "#src/services/artifact/sets/createWanderersTroupeSetModule";

// Each set whose bonus waits on combat, by the set table's id, and how that bonus is built as a module from its row. A set
// The world carries with no module here gives only its attributes
export const ArtifactSetIdCreateModuleMap: Readonly<
  Partial<Record<number, (bonus: ArtifactSetBonus) => PassiveModule>>
> = {
  [ADVENTURER_ARTIFACT_SET_ID]: createAdventurerSetModule,
  [AUBADE_OF_MORNINGSTAR_AND_MOON_ARTIFACT_SET_ID]: createAubadeOfMorningstarAndMoonSetModule,
  [BERSERKER_ARTIFACT_SET_ID]: createBerserkerSetModule,
  [BLIZZARD_STRAYER_ARTIFACT_SET_ID]: createBlizzardStrayerSetModule,
  [BLOODSTAINED_CHIVALRY_ARTIFACT_SET_ID]: createBloodstainedChivalrySetModule,
  [BRAVE_HEART_ARTIFACT_SET_ID]: createBraveHeartSetModule,
  [CRIMSON_WITCH_ARTIFACT_SET_ID]: createCrimsonWitchSetModule,
  [DEEPWOOD_MEMORIES_ARTIFACT_SET_ID]: createDeepwoodMemoriesSetModule,
  [DEFENDERS_WILL_ARTIFACT_SET_ID]: createDefendersWillSetModule,
  [DESERT_PAVILION_CHRONICLE_ARTIFACT_SET_ID]: createDesertPavilionChronicleSetModule,
  [DISENCHANTMENT_IN_DEEP_SHADOW_ARTIFACT_SET_ID]: createDisenchantmentInDeepShadowSetModule,
  [ECHOES_OF_AN_OFFERING_ARTIFACT_SET_ID]: createEchoesOfAnOfferingSetModule,
  [EMBLEM_OF_SEVERED_FATE_ARTIFACT_SET_ID]: createEmblemOfSeveredFateSetModule,
  [EXILE_ARTIFACT_SET_ID]: createExileSetModule,
  [FINALE_OF_THE_DEEP_GALLERIES_ARTIFACT_SET_ID]: createFinaleOfTheDeepGalleriesSetModule,
  [FLOWER_OF_PARADISE_LOST_ARTIFACT_SET_ID]: createFlowerOfParadiseLostSetModule,
  [GAMBLER_ARTIFACT_SET_ID]: createGamblerSetModule,
  [GILDED_DREAMS_ARTIFACT_SET_ID]: createGildedDreamsSetModule,
  [GLADIATORS_FINALE_ARTIFACT_SET_ID]: createGladiatorsFinaleSetModule,
  [GOLDEN_TROUPE_ARTIFACT_SET_ID]: createGoldenTroupeSetModule,
  [HEART_OF_DEPTH_ARTIFACT_SET_ID]: createHeartOfDepthSetModule,
  [HUSK_OF_OPULENT_DREAMS_ARTIFACT_SET_ID]: createHuskOfOpulentDreamsSetModule,
  [INSTRUCTOR_ARTIFACT_SET_ID]: createInstructorSetModule,
  [LAVAWALKER_ARTIFACT_SET_ID]: createLavawalkerSetModule,
  [LONG_NIGHTS_OATH_ARTIFACT_SET_ID]: createLongNightsOathSetModule,
  [LUCKY_DOG_ARTIFACT_SET_ID]: createLuckyDogSetModule,
  [MAIDEN_BELOVED_ARTIFACT_SET_ID]: createMaidenBelovedSetModule,
  [MARECHAUSSEE_HUNTER_ARTIFACT_SET_ID]: createMarechausseeHunterSetModule,
  [MARTIAL_ARTIST_ARTIFACT_SET_ID]: createMartialArtistSetModule,
  [MIRRORED_NYMPH_ARTIFACT_SET_ID]: createMirroredNymphSetModule,
  [NIGHT_OF_THE_SKYS_UNVEILING_ARTIFACT_SET_ID]: createNightOfTheSkysUnveilingSetModule,
  [NOBLESSE_OBLIGE_ARTIFACT_SET_ID]: createNoblesseObligeSetModule,
  [OBSIDIAN_CODEX_ARTIFACT_SET_ID]: createObsidianCodexSetModule,
  [OCEAN_HUED_CLAM_ARTIFACT_SET_ID]: createOceanHuedClamSetModule,
  [PALE_FLAME_ARTIFACT_SET_ID]: createPaleFlameSetModule,
  [RESOLUTION_OF_SOJOURNER_ARTIFACT_SET_ID]: createResolutionOfSojournerSetModule,
  [RETRACING_BOLIDE_ARTIFACT_SET_ID]: createRetracingBolideSetModule,
  [SCARLETPROOF_ARTIFACT_SET_ID]: createScarletproofSetModule,
  [SCHOLAR_ARTIFACT_SET_ID]: createScholarSetModule,
  [SHIMENAWAS_REMINISCENCE_ARTIFACT_SET_ID]: createShimenawasReminiscenceSetModule,
  [SILKEN_MOON_SERENADE_ARTIFACT_SET_ID]: createSilkenMoonsSerenadeSetModule,
  [SONG_OF_DAYS_PAST_ARTIFACT_SET_ID]: createSongOfDaysPastSetModule,
  [TENACITY_OF_THE_MILLELITH_ARTIFACT_SET_ID]: createTenacityOfTheMillelithSetModule,
  [THUNDERING_FURY_ARTIFACT_SET_ID]: createThunderingFurySetModule,
  [THUNDERSOOTER_ARTIFACT_SET_ID]: createThundersooterSetModule,
  [TRAVELING_DOCTOR_ARTIFACT_SET_ID]: createTravelingDoctorSetModule,
  [VERMILLION_HEREAFTER_ARTIFACT_SET_ID]: createVermillionHereafterSetModule,
  [VIRIDESCENT_VENERER_ARTIFACT_SET_ID]: createViridescentVenererSetModule,
  [VOURUKASHAS_GLOW_ARTIFACT_SET_ID]: createVourukashasGlowSetModule,
  [WANDERERS_TROUPE_ARTIFACT_SET_ID]: createWanderersTroupeSetModule,
};
