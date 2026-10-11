import type { ArtifactSetBonus } from "#src/models/artifact/ArtifactSetBonus";
import type { ArtifactSetModule } from "#src/models/artifact/ArtifactSetModule";

import { INSTRUCTOR_ARTIFACT_SET_ID } from "#src/services/artifact/constants";
import { createInstructorSetModule } from "#src/services/artifact/sets/createInstructorSetModule";

// Each set whose bonus waits on combat, by the set table's id, and how that bonus is built as a module from its row. A set
// The world carries with no module here gives only its attributes
export const ArtifactSetIdCreateModuleMap: Readonly<
  Partial<Record<number, (bonus: ArtifactSetBonus) => ArtifactSetModule>>
> = { [INSTRUCTOR_ARTIFACT_SET_ID]: createInstructorSetModule };
