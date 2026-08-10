import { describe } from "vitest";

// Every room-scoped store keys its state by the room in the route, so its state only exists once one is current.
// Set after mounting, which resets the route, and through triggerRef because currentRoute is a shallowRef.
export const setCurrentRoomId = (roomId: string) => {
  const router = useRouter();
  router.currentRoute.value.params.id = roomId;
  triggerRef(router.currentRoute);
};

describe.todo("setCurrentRoomId");
