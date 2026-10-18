import type { ArtifactSetBonus } from "#src/models/artifact/ArtifactSetBonus";
import type { PassiveModule } from "#src/models/kit/PassiveModule";

import {
  ADVENTURER_ARTIFACT_SET_ID,
  BERSERKER_ARTIFACT_SET_ID,
  DEFENDERS_WILL_ARTIFACT_SET_ID,
  EXILE_ARTIFACT_SET_ID,
  GLADIATORS_FINALE_ARTIFACT_SET_ID,
  HEART_OF_DEPTH_ARTIFACT_SET_ID,
  INSTRUCTOR_ARTIFACT_SET_ID,
  LUCKY_DOG_ARTIFACT_SET_ID,
  MAIDEN_BELOVED_ARTIFACT_SET_ID,
  MARTIAL_ARTIST_ARTIFACT_SET_ID,
  NOBLESSE_OBLIGE_ARTIFACT_SET_ID,
  RETRACING_BOLIDE_ARTIFACT_SET_ID,
  TRAVELING_DOCTOR_ARTIFACT_SET_ID,
  WANDERERS_TROUPE_ARTIFACT_SET_ID,
} from "#src/services/artifact/constants";
import { createAdventurerSetModule } from "#src/services/artifact/sets/createAdventurerSetModule";
import { createBerserkerSetModule } from "#src/services/artifact/sets/createBerserkerSetModule";
import { createDefendersWillSetModule } from "#src/services/artifact/sets/createDefendersWillSetModule";
import { createExileSetModule } from "#src/services/artifact/sets/createExileSetModule";
import { createGladiatorsFinaleSetModule } from "#src/services/artifact/sets/createGladiatorsFinaleSetModule";
import { createHeartOfDepthSetModule } from "#src/services/artifact/sets/createHeartOfDepthSetModule";
import { createInstructorSetModule } from "#src/services/artifact/sets/createInstructorSetModule";
import { createLuckyDogSetModule } from "#src/services/artifact/sets/createLuckyDogSetModule";
import { createMaidenBelovedSetModule } from "#src/services/artifact/sets/createMaidenBelovedSetModule";
import { createMartialArtistSetModule } from "#src/services/artifact/sets/createMartialArtistSetModule";
import { createNoblesseObligeSetModule } from "#src/services/artifact/sets/createNoblesseObligeSetModule";
import { createRetracingBolideSetModule } from "#src/services/artifact/sets/createRetracingBolideSetModule";
import { createTravelingDoctorSetModule } from "#src/services/artifact/sets/createTravelingDoctorSetModule";
import { createWanderersTroupeSetModule } from "#src/services/artifact/sets/createWanderersTroupeSetModule";

// Each set whose bonus waits on combat, by the set table's id, and how that bonus is built as a module from its row. A set
// The world carries with no module here gives only its attributes
export const ArtifactSetIdCreateModuleMap: Readonly<
  Partial<Record<number, (bonus: ArtifactSetBonus) => PassiveModule>>
> = {
  [ADVENTURER_ARTIFACT_SET_ID]: createAdventurerSetModule,
  [BERSERKER_ARTIFACT_SET_ID]: createBerserkerSetModule,
  [DEFENDERS_WILL_ARTIFACT_SET_ID]: createDefendersWillSetModule,
  [EXILE_ARTIFACT_SET_ID]: createExileSetModule,
  [GLADIATORS_FINALE_ARTIFACT_SET_ID]: createGladiatorsFinaleSetModule,
  [HEART_OF_DEPTH_ARTIFACT_SET_ID]: createHeartOfDepthSetModule,
  [INSTRUCTOR_ARTIFACT_SET_ID]: createInstructorSetModule,
  [LUCKY_DOG_ARTIFACT_SET_ID]: createLuckyDogSetModule,
  [MAIDEN_BELOVED_ARTIFACT_SET_ID]: createMaidenBelovedSetModule,
  [MARTIAL_ARTIST_ARTIFACT_SET_ID]: createMartialArtistSetModule,
  [NOBLESSE_OBLIGE_ARTIFACT_SET_ID]: createNoblesseObligeSetModule,
  [RETRACING_BOLIDE_ARTIFACT_SET_ID]: createRetracingBolideSetModule,
  [TRAVELING_DOCTOR_ARTIFACT_SET_ID]: createTravelingDoctorSetModule,
  [WANDERERS_TROUPE_ARTIFACT_SET_ID]: createWanderersTroupeSetModule,
};
