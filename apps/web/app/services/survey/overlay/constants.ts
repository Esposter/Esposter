import { createTable } from "#src/services/shared/overlay/createTable";
import { surveyResponsesInResource } from "@esposter/db-schema";

// A survey response row, held by its id, which is the seed the respondent's first save creates it under
export const surveyResponseTable = createTable(surveyResponsesInResource);
