// @vitest-environment nuxt
import type { ResourceActivityInResource } from "@esposter/db-schema";

import { CursorPaginationData } from "#shared/models/pagination/cursor/CursorPaginationData";
import { useActivityStore } from "@/store/resource/activity";
import { v7 } from "uuid";
import { describe, expect, test } from "vitest";

const createActivity = (id: string) => ({ id }) as ResourceActivityInResource;
const createReader =
  (...activityIds: string[]) =>
  () =>
    Promise.resolve(
      Object.assign(new CursorPaginationData<ResourceActivityInResource>(), {
        hasMore: true,
        items: activityIds.map((id) => createActivity(id)),
        nextCursor: "nextCursor",
      }),
    );
// Set on the route rather than navigated to: the blade's page is auth-guarded, so a real push never resolves.
// Through triggerRef because currentRoute is a shallowRef
const openActivityBlade = (id: string) => {
  const router = useRouter();
  Object.assign(router.currentRoute.value.params, { id });
  triggerRef(router.currentRoute);
};

describe(useActivityStore, () => {
  const firstResourceId = v7();
  const secondResourceId = v7();
  const firstActivityId = v7();
  const secondActivityId = v7();

  // The store outlives the blade, so a second resource's blade mounts against state the first one filled. Held
  // As one slice, its rows, `hasMore` and cursor all still answer for the previous resource until its own read
  // Lands — and paging in that window appends the previous resource's next page onto this resource's list
  test("keeps each resource's activity in its own slice", async () => {
    expect.hasAssertions();

    const activityStore = useActivityStore();
    const { hasMore, items } = storeToRefs(activityStore);
    const { readItems } = activityStore;
    openActivityBlade(firstResourceId);
    await readItems(createReader(firstActivityId));

    expect(items.value.map(({ id }) => id)).toStrictEqual([firstActivityId]);

    openActivityBlade(secondResourceId);

    expect(items.value).toStrictEqual([]);
    expect(hasMore.value).toBe(false);

    await readItems(createReader(secondActivityId));

    expect(items.value.map(({ id }) => id)).toStrictEqual([secondActivityId]);

    openActivityBlade(firstResourceId);

    expect(items.value.map(({ id }) => id)).toStrictEqual([firstActivityId]);
  });
});
