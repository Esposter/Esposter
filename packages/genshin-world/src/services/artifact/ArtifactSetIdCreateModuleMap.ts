import type { ArtifactSetBonus } from "#src/models/artifact/ArtifactSetBonus";
import type { ArtifactSetModule } from "#src/models/artifact/ArtifactSetModule";

import {
  ADVENTURER_ARTIFACT_SET_ID,
  BERSERKER_ARTIFACT_SET_ID,
  EXILE_ARTIFACT_SET_ID,
  INSTRUCTOR_ARTIFACT_SET_ID,
  LUCKY_DOG_ARTIFACT_SET_ID,
  TRAVELING_DOCTOR_ARTIFACT_SET_ID,
} from "#src/services/artifact/constants";
import { createAdventurerSetModule } from "#src/services/artifact/sets/createAdventurerSetModule";
import { createBerserkerSetModule } from "#src/services/artifact/sets/createBerserkerSetModule";
import { createExileSetModule } from "#src/services/artifact/sets/createExileSetModule";
import { createInstructorSetModule } from "#src/services/artifact/sets/createInstructorSetModule";
import { createLuckyDogSetModule } from "#src/services/artifact/sets/createLuckyDogSetModule";
import { createTravelingDoctorSetModule } from "#src/services/artifact/sets/createTravelingDoctorSetModule";

// Each set whose bonus waits on combat, by the set table's id, and how that bonus is built as a module from its row. A set
// The world carries with no module here gives only its attributes
export const ArtifactSetIdCreateModuleMap: Readonly<
  Partial<Record<number, (bonus: ArtifactSetBonus) => ArtifactSetModule>>
> = {
  [ADVENTURER_ARTIFACT_SET_ID]: createAdventurerSetModule,
  [BERSERKER_ARTIFACT_SET_ID]: createBerserkerSetModule,
  [EXILE_ARTIFACT_SET_ID]: createExileSetModule,
  [INSTRUCTOR_ARTIFACT_SET_ID]: createInstructorSetModule,
  [LUCKY_DOG_ARTIFACT_SET_ID]: createLuckyDogSetModule,
  [TRAVELING_DOCTOR_ARTIFACT_SET_ID]: createTravelingDoctorSetModule,
};
