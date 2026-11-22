// @vitest-environment nuxt
import { getRouteParam } from "#src/util/router/getRouteParam";
import { v7 } from "uuid";
import { describe, expect, test } from "vitest";

// Every room- and resource-scoped store keys its state by the id in the route, so its state only exists once one is
// Current. Set after mounting, which resets the route, and through triggerRef because currentRoute is a shallowRef.
export const setRouteId = (id: string) => {
  const router = useRouter();
  Object.assign(router.currentRoute.value.params, { id });
  triggerRef(router.currentRoute);
};

describe(setRouteId, () => {
  // The id is written into the existing params object rather than onto a new route, so nothing downstream sees it
  // Without the triggerRef — reading the computed first is what makes the second read prove the invalidation
  test("puts the id on the route and invalidates what reads it", () => {
    expect.hasAssertions();

    const id = v7();
    const router = useRouter();
    const currentId = computed(() => getRouteParam(router.currentRoute.value.params, "id"));

    expect(currentId.value).toBe("");

    setRouteId(id);

    expect(currentId.value).toBe(id);
  });
});
