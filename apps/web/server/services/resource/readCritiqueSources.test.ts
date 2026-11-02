import type { Context } from "#server/trpc/context";
import type { WebpageDocument } from "#shared/models/pageBuilder/WebpageDocument";

import { readCritiqueSources } from "#server/services/resource/readCritiqueSources";
import { createMockContext } from "#server/trpc/context.test";
import { SurveyPublishState } from "#shared/models/pageBuilder/SurveyPublishState";
import { TEST_ID, TEST_ROOT, TEST_SURVEY_ID } from "#shared/services/pageBuilder/constants.test";
import { createTestSurveyInviteNode, createTestTextNode } from "#shared/services/pageBuilder/critique/constants.test";
import { afterEach, beforeAll, describe, expect, test, vi } from "vitest";

describe(readCritiqueSources, () => {
  let db: Context["db"];
  const userId = crypto.randomUUID();

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

    const select = vi.spyOn(db, "select");
    const document: WebpageDocument = {
      content: [createTestSurveyInviteNode(TEST_ID, TEST_SURVEY_ID)],
      root: TEST_ROOT,
    };
    const sources = await readCritiqueSources(db, userId, document);

    expect(select).toHaveBeenCalledWith();
    expect(sources.lookupSurveyPublishState(TEST_SURVEY_ID)).toBe(SurveyPublishState.Unpublished);
  });
});
