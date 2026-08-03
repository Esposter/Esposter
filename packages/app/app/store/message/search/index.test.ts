// @vitest-environment nuxt
import type { Router } from "vue-router";

import { useSearchMessageStore } from "@/store/message/search";
import { StandardMessageEntity } from "@esposter/db-schema";
import { createPinia, setActivePinia } from "pinia";
import { beforeAll, beforeEach, describe, expect, test } from "vitest";

describe(useSearchMessageStore, () => {
  let router: Router;
  const roomId = crypto.randomUUID();
  const otherRoomId = crypto.randomUUID();
  const userId = crypto.randomUUID();

  beforeAll(() => {
    router = useRouter();
  });

  beforeEach(() => {
    setActivePinia(createPinia());
    router.currentRoute.value.params.id = roomId;
  });

  test("keeps each tab's results in its own slice", () => {
    expect.hasAssertions();

    const searchMessageStore = useSearchMessageStore();
    const { count, hasFiles, items, page } = storeToRefs(searchMessageStore);
    // The Files tab browses attachments with no query — its results must not survive into the Search tab,
    // Whose pagination would re-issue them as an empty query the endpoint rejects
    hasFiles.value = true;
    items.value = [new StandardMessageEntity({ partitionKey: roomId, rowKey: "", userId })];
    count.value = 1;
    page.value = 2;
    hasFiles.value = false;

    expect(items.value).toStrictEqual([]);
    expect(count.value).toBe(0);
    expect(page.value).toBe(1);
  });

  test("keeps the files tab out of the next room", () => {
    expect.hasAssertions();

    const searchMessageStore = useSearchMessageStore();
    const { hasFiles } = storeToRefs(searchMessageStore);
    hasFiles.value = true;
    router.currentRoute.value = { ...router.currentRoute.value, params: { id: otherRoomId } };

    expect(hasFiles.value).toBe(false);
  });
});
