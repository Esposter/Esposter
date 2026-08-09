// @vitest-environment nuxt
import type { ResourceActivityEntity } from "@esposter/db-schema";

import { CursorPaginationData } from "#shared/models/pagination/cursor/CursorPaginationData";
import { useActivityStore } from "@/store/resource/activity";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, test } from "vitest";

const createActivity = (rowKey: string) => ({ rowKey }) as ResourceActivityEntity;
const createReader =
  (...rowKeys: string[]) =>
  () =>
    Promise.resolve(
      Object.assign(new CursorPaginationData<ResourceActivityEntity>(), {
        hasMore: true,
        items: rowKeys.map((rowKey) => createActivity(rowKey)),
        nextCursor: "cursor",
      }),
    );
// Set on the route rather than navigated to: the blade's page is auth-guarded, so a real push never resolves.
// Through triggerRef because currentRoute is a shallowRef
const openActivityBlade = (id: string) => {
  const router = useRouter();
  router.currentRoute.value.params.id = id;
  triggerRef(router.currentRoute);
};

describe(useActivityStore, () => {
  const firstResourceId = crypto.randomUUID();
  const secondResourceId = crypto.randomUUID();

  beforeEach(() => {
    setActivePinia(createPinia());
  });

  // The store outlives the blade, so a second resource's blade mounts against state the first one filled. Held
  // As one slice, its rows, `hasMore` and cursor all still answer for the previous resource until its own read
  // Lands — and paging in that window appends the previous resource's next page onto this resource's list
  test("keeps each resource's activity in its own slice", async () => {
    expect.hasAssertions();

    const activityStore = useActivityStore();
    const { hasMore, items } = storeToRefs(activityStore);
    const { readItems } = activityStore;
    openActivityBlade(firstResourceId);
    await readItems(createReader("first"));

    expect(items.value.map(({ rowKey }) => rowKey)).toStrictEqual(["first"]);

    openActivityBlade(secondResourceId);

    expect(items.value).toStrictEqual([]);
    expect(hasMore.value).toBe(false);

    await readItems(createReader("second"));

    expect(items.value.map(({ rowKey }) => rowKey)).toStrictEqual(["second"]);

    openActivityBlade(firstResourceId);

    expect(items.value.map(({ rowKey }) => rowKey)).toStrictEqual(["first"]);
  });
});
