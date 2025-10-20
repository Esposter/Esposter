import { DatabaseEntityType } from "@esposter/db-schema";
import { uncapitalize } from "@esposter/shared";

export const SURVEY_MODEL_FILENAME = `${uncapitalize(DatabaseEntityType.Survey)}.json`;
export const PUBLISH_DIRECTORY_PATH = "publish";
