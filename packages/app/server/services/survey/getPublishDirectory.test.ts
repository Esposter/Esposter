import type { Survey } from "@esposter/db-schema";

import { PUBLISH_DIRECTORY_PATH } from "@@/server/services/survey/constants";
import { getPublishDirectory } from "@@/server/services/survey/getPublishDirectory";
import { getVersionPath } from "@esposter/db";
import { describe, expect, test } from "vitest";

describe(getPublishDirectory, () => {
  const survey: Survey = {
    createdAt: new Date(),
    deletedAt: null,
    group: null,
    id: crypto.randomUUID(),
    model: "model",
    modelVersion: 1,
    name: "name",
    publishedAt: null,
    publishVersion: 1,
    updatedAt: new Date(),
    userId: crypto.randomUUID(),
  };

  test("gets publish directory", () => {
    expect.hasAssertions();

    expect(getPublishDirectory(survey)).toBe(
      getVersionPath(survey.publishVersion, `${survey.id}/${PUBLISH_DIRECTORY_PATH}`),
    );
  });
});
