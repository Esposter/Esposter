import type { ResourceInResource } from "@esposter/db-schema";

import { getDanglingProgramBindingError } from "#server/services/program/getDanglingProgramBindingError";
import { readResourceContent } from "#server/services/resource/readResourceContent";
import { programResourceSchema } from "#shared/models/resource/program/ProgramResource";

// The audience, key column and survey a program is bound to, which every read that issues or reads its participants
// Needs. A program missing any of them is a dangling binding, and that error is raised here, so the check is written once
export const readProgramBinding = async (programId: ResourceInResource["id"]) => {
  const content = await readResourceContent(programResourceSchema, programId);
  if (!content?.audience || !content.keyColumn || !content.surveyId) throw getDanglingProgramBindingError();
  const { audience, emailId, keyColumn, surveyId } = content;
  return { audience, emailId, keyColumn, surveyId };
};
