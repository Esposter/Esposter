import type { Survey } from "@esposter/db-schema";

import { PUBLISH_DIRECTORY_PATH } from "@@/server/services/survey/constants";
import { getVersionPath } from "@esposter/db";

export const getPublishDirectory = (survey: Survey) =>
  getVersionPath(survey.publishVersion, `${survey.id}/${PUBLISH_DIRECTORY_PATH}`);
