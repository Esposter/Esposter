// @vitest-environment nuxt
import type { EffectScope } from "vue";

import { createResourceListItem } from "#shared/services/resource/list/createResourceListItem.test";
import { useReadPublishedSurveys } from "@/composables/survey/useReadPublishedSurveys";
import { useSession } from "@/services/auth/authClient.test";
import { setupMswTrpc } from "@/services/trpc/mswTrpc.test";
import { ResourceType } from "@esposter/db-schema";
import { flushPromises } from "@vue/test-utils";
import { until } from "@vueuse/core";
import { afterEach, assert, beforeEach, describe, expect, test, vi } from "vitest";

vi.mock(import("@/services/auth/authClient"), () => import("@/services/auth/authClient.test"));

describe(useReadPublishedSurveys, () => {
  const { trpcMsw } = setupMswTrpc();
  // The focus listener belongs to the composable's scope, so each test runs it in one that stops when the test ends
  let scope: EffectScope;

  beforeEach(() => {
    scope = effectScope();
  });
  afterEach(() => {
    scope.stop();
  });
  const createSurvey = (isPublished: boolean) => {
    const survey = createResourceListItem({ type: ResourceType.Survey });
    return {
      ...survey,
      publication: isPublished
        ? {
            createdAt: new Date(0),
            deletedAt: null,
            publishedAt: new Date(0),
            publishedContentVersion: 0,
            publishVersion: 1,
            resourceId: survey.id,
            updatedAt: new Date(0),
          }
        : null,
    };
  };

  // The focus re-read is what carries a publish made in another tab into the list while the editor stays open
  test("lists a survey published after the editor opened once the owner returns to the window", async () => {
    expect.hasAssertions();

    useSession.mockReturnValue(ref({ data: { user: { id: crypto.randomUUID() } } }));
    const draft = createSurvey(false);
    const newlyPublished = createSurvey(true);
    let items = [draft];
    const readSurveys = vi.fn(() => ({ hasMore: false, items }));
    trpcMsw.survey.readResources.query(readSurveys);
    const composable = scope.run(useReadPublishedSurveys);
    assert.exists(composable);
    const { publishedSurveys } = composable;
    await vi.waitFor(() => expect(readSurveys).toHaveBeenCalledOnce());
    await flushPromises();

    expect(publishedSurveys.value).toHaveLength(0);

    items = [draft, newlyPublished];
    window.dispatchEvent(new Event("focus"));
    await vi.waitFor(() => expect(publishedSurveys.value.map(({ id }) => id)).toStrictEqual([newlyPublished.id]));
  });

  // The focus re-read lands while the watch read is still in flight, so the watch read's response arrives last.
  // It must not write its older list over the newer one
  test("keeps the newest list when an earlier read's response lands after a later one", async () => {
    expect.hasAssertions();

    useSession.mockReturnValue(ref({ data: { user: { id: crypto.randomUUID() } } }));
    const draft = createSurvey(false);
    const newlyPublished = createSurvey(true);
    const { promise: firstReadStarted, resolve: markFirstReadStarted } = Promise.withResolvers<void>();
    const { promise: firstRead, resolve: releaseFirstRead } = Promise.withResolvers<void>();
    let reads = 0;
    trpcMsw.survey.readResources.query(async () => {
      reads += 1;
      if (reads > 1) return { hasMore: false, items: [draft, newlyPublished] };

      markFirstReadStarted();
      await firstRead;
      return { hasMore: false, items: [draft] };
    });
    const composable = scope.run(useReadPublishedSurveys);
    assert.exists(composable);
    const { publishedSurveys } = composable;
    await firstReadStarted;

    window.dispatchEvent(new Event("focus"));
    await until(publishedSurveys).toMatch((surveys) => surveys.length > 0);
    releaseFirstRead();
    await flushPromises();

    expect(publishedSurveys.value.map(({ id }) => id)).toStrictEqual([newlyPublished.id]);
  });

  test("does not read the survey list on focus while signed out", async () => {
    expect.hasAssertions();

    useSession.mockReturnValue(ref({ data: null }));
    const readSurveys = vi.fn(() => ({ hasMore: false, items: [] }));
    trpcMsw.survey.readResources.query(readSurveys);
    scope.run(useReadPublishedSurveys);
    window.dispatchEvent(new Event("focus"));
    await flushPromises();

    expect(readSurveys).not.toHaveBeenCalled();
  });
});
