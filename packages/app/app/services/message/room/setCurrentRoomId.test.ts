// @vitest-environment nuxt
import { describe, expect, test } from "vitest";
// Every room-scoped store keys its state by the room in the route, so its state only exists once one is current.
// Set after mounting, which resets the route, and through triggerRef because currentRoute is a shallowRef.
export const setCurrentRoomId = (roomId: string) => {
  const router = useRouter();
  router.currentRoute.value.params.id = roomId;
  triggerRef(router.currentRoute);
};

describe(setCurrentRoomId, () => {
  // The id is written into the existing params object rather than onto a new route, so nothing downstream sees it
  // Without the triggerRef — reading the computed first is what makes the second read prove the invalidation
  test("puts the room id on the route and invalidates what reads it", () => {
    expect.hasAssertions();

    const roomId = "roomId";
    const router = useRouter();
    const currentRoomId = computed(() => router.currentRoute.value.params.id);

    expect(currentRoomId.value).toBeUndefined();

    setCurrentRoomId(roomId);

    expect(currentRoomId.value).toBe(roomId);
  });
});
