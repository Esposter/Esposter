import type { ArtifactSetBonus } from "#src/models/artifact/ArtifactSetBonus";
import type { ArtifactSetModule } from "#src/models/artifact/ArtifactSetModule";

import {
  ADVENTURER_ARTIFACT_SET_ID,
  ARTIFACT_SET_10003_ID,
  ARTIFACT_SET_10006_ID,
  ARTIFACT_SET_14004_ID,
  ARTIFACT_SET_15001_ID,
  ARTIFACT_SET_15003_ID,
  ARTIFACT_SET_15007_ID,
  ARTIFACT_SET_15015_ID,
  ARTIFACT_SET_15016_ID,
  BERSERKER_ARTIFACT_SET_ID,
  EXILE_ARTIFACT_SET_ID,
  INSTRUCTOR_ARTIFACT_SET_ID,
  LUCKY_DOG_ARTIFACT_SET_ID,
  TRAVELING_DOCTOR_ARTIFACT_SET_ID,
} from "#src/services/artifact/constants";
import { createAdventurerSetModule } from "#src/services/artifact/sets/createAdventurerSetModule";
import { createArtifactSet10003Module } from "#src/services/artifact/sets/createArtifactSet10003Module";
import { createArtifactSet10006Module } from "#src/services/artifact/sets/createArtifactSet10006Module";
import { createArtifactSet14004Module } from "#src/services/artifact/sets/createArtifactSet14004Module";
import { createArtifactSet15001Module } from "#src/services/artifact/sets/createArtifactSet15001Module";
import { createArtifactSet15003Module } from "#src/services/artifact/sets/createArtifactSet15003Module";
import { createArtifactSet15007Module } from "#src/services/artifact/sets/createArtifactSet15007Module";
import { createArtifactSet15015Module } from "#src/services/artifact/sets/createArtifactSet15015Module";
import { createArtifactSet15016Module } from "#src/services/artifact/sets/createArtifactSet15016Module";
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
  [ARTIFACT_SET_10003_ID]: createArtifactSet10003Module,
  [ARTIFACT_SET_10006_ID]: createArtifactSet10006Module,
  [ARTIFACT_SET_14004_ID]: createArtifactSet14004Module,
  [ARTIFACT_SET_15001_ID]: createArtifactSet15001Module,
  [ARTIFACT_SET_15003_ID]: createArtifactSet15003Module,
  [ARTIFACT_SET_15007_ID]: createArtifactSet15007Module,
  [ARTIFACT_SET_15015_ID]: createArtifactSet15015Module,
  [ARTIFACT_SET_15016_ID]: createArtifactSet15016Module,
  [BERSERKER_ARTIFACT_SET_ID]: createBerserkerSetModule,
  [EXILE_ARTIFACT_SET_ID]: createExileSetModule,
  [INSTRUCTOR_ARTIFACT_SET_ID]: createInstructorSetModule,
  [LUCKY_DOG_ARTIFACT_SET_ID]: createLuckyDogSetModule,
  [TRAVELING_DOCTOR_ARTIFACT_SET_ID]: createTravelingDoctorSetModule,
};
