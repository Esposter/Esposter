// @vitest-environment nuxt
import type { RecentResourceView } from "@/models/resource/search/RecentResourceView";
import type { Resource } from "@esposter/db-schema";

import { useRecordResourceView } from "@/composables/resource/search/useRecordResourceView";
import { LocalStorageKey } from "@/services/shared/LocalStorageKey";
import { ResourceType } from "@esposter/db-schema";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

describe(useRecordResourceView, () => {
  const id = crypto.randomUUID();
  const name = "name";
  const createResource = (contentVersion: number) =>
    ({ contentVersion, id, name, type: ResourceType.Sheet }) as Resource;
  const readRecentResourceViews = (): RecentResourceView[] =>
    JSON.parse(localStorage.getItem(LocalStorageKey.ResourceRecentViews) ?? "[]");

  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers({ now: 0 });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test("records the resource that was opened", async () => {
    expect.hasAssertions();

    useRecordResourceView(ref(createResource(0)));
    await nextTick();

    expect(readRecentResourceViews()).toStrictEqual([
      { id, name, type: ResourceType.Sheet, viewedAt: new Date(0).toISOString() },
    ]);
  });

  // Save, rename and updateTags each replace the resource ref with a new object, so watching the object would
  // Rewrite the entry every few seconds of autosave and order Recent by last autosave rather than last open
  test("does not re-record when a save replaces the resource object", async () => {
    expect.hasAssertions();

    const resource = ref(createResource(0));
    useRecordResourceView(resource);
    await nextTick();
    vi.setSystemTime(1);
    resource.value = createResource(1);
    await nextTick();

    expect(readRecentResourceViews()).toStrictEqual([
      { id, name, type: ResourceType.Sheet, viewedAt: new Date(0).toISOString() },
    ]);
  });
});
