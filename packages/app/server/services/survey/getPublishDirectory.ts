import type { Survey } from "@esposter/db";

import { getVersionPath } from "@@/server/services/azure/container/getVersionPath";
import { PUBLISH_DIRECTORY_PATH } from "@@/server/services/survey/constants";

export const getPublishDirectory = (survey: Survey) =>
  getVersionPath(survey.publishVersion, `${survey.id}/${PUBLISH_DIRECTORY_PATH}`);
