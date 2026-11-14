import type { Context } from "#server/trpc/context";
import type { WebpageDocument } from "#shared/models/pageBuilder/WebpageDocument";

import { readCritiqueSources } from "#server/services/resource/readCritiqueSources";
import { createMockContext, createMockUser, getMockSession } from "#server/trpc/context.test";
import { SurveyPublishState } from "#shared/models/pageBuilder/SurveyPublishState";
import { TEST_ID, TEST_ROOT } from "#shared/services/pageBuilder/constants.test";
import { createTestSurveyInviteNode, createTestTextNode } from "#shared/services/pageBuilder/critique/constants.test";
import { resourcePublicationsInResource, resourcesInResource, ResourceType } from "@esposter/db-schema";
import { v7 } from "uuid";
import { afterEach, beforeAll, describe, expect, test, vi } from "vitest";

describe(readCritiqueSources, () => {
  let db: Context["db"];
  const userId = getMockSession().user.id;

  beforeAll(async () => {
    db = (await createMockContext()).db;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("a page with no survey invite reads no survey", async () => {
    expect.hasAssertions();

    const select = vi.spyOn(db, "select");
    const document: WebpageDocument = { content: [createTestTextNode(TEST_ID, {})], root: TEST_ROOT };

    await readCritiqueSources(db, userId, document);

    expect(select).not.toHaveBeenCalled();
  });

  test("a page with a survey invite reads the owner's published surveys", async () => {
    expect.hasAssertions();

    const { id: otherUserId } = await createMockUser(db);
    const publishedSurveyId = v7();
    const unpublishedSurveyId = v7();
    const otherUsersSurveyId = v7();
    await db.insert(resourcesInResource).values([
      { id: publishedSurveyId, name: "name", type: ResourceType.Survey, userId },
      { id: unpublishedSurveyId, name: "name", type: ResourceType.Survey, userId },
      { id: otherUsersSurveyId, name: "name", type: ResourceType.Survey, userId: otherUserId },
    ]);
    await db
      .insert(resourcePublicationsInResource)
      .values([{ resourceId: publishedSurveyId }, { resourceId: otherUsersSurveyId }]);
    const document: WebpageDocument = {
      content: [createTestSurveyInviteNode(TEST_ID, publishedSurveyId)],
      root: TEST_ROOT,
    };
    const sources = await readCritiqueSources(db, userId, document);

    expect(sources.lookupSurveyPublishState(publishedSurveyId)).toBe(SurveyPublishState.Published);
    expect(sources.lookupSurveyPublishState(unpublishedSurveyId)).toBe(SurveyPublishState.Unpublished);
    expect(sources.lookupSurveyPublishState(otherUsersSurveyId)).toBe(SurveyPublishState.Unpublished);
  });
});
