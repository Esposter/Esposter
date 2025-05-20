import type { Survey } from "#shared/db/schema/surveys";

import { getVersionPath } from "@@/server/services/azure/container/getVersionPath";
import { PUBLISH_DIRECTORY_PATH } from "@@/server/services/surveyer/constants";

export const getPublishDirectory = (survey: Survey) =>
  getVersionPath(survey.publishVersion, `${survey.id}/${PUBLISH_DIRECTORY_PATH}`);
