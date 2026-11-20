// @vitest-environment nuxt
import { flushCache } from "#src/composables/cache/indexedDb/flushCache.test";
import { goOffline } from "#src/composables/shared/network.test";
import { RoomIndexedDbStoreConfiguration } from "#src/services/cache/indexedDb/configurations/RoomIndexedDbStoreConfiguration";
import { UserToRoomIndexedDbStoreConfiguration } from "#src/services/cache/indexedDb/configurations/UserToRoomIndexedDbStoreConfiguration";
import { resetIndexedDb } from "#src/services/cache/indexedDb/openIndexedDb";
import { writeIndexedDb } from "#src/services/cache/indexedDb/writeIndexedDb";
import { useSession } from "#src/services/auth/authClient.test";
import { createRoom } from "#src/services/message/room/createRoom.test";
import { createUserToRoom } from "#src/services/message/room/createUserToRoom.test";
import { useRoomStore } from "#src/store/message/room/index";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { v7 } from "uuid";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

describe(useRoomCache, () => {
  const session = { user: { id: v7() } };
  const room = createRoom("name");
  const userToRoom = createUserToRoom({ roomId: room.id, userId: session.user.id });
  const mountCache = async () => {
    await mountSuspended(
      defineComponent({
        render: () => h("div"),
        setup: () => {
          useRoomCache();
        },
      }),
    );
  };

  beforeEach(() => {
    goOffline();
    useSession.mockImplementation((fetcher) => (fetcher ? { data: ref(session) } : ref({ data: session })));
  });

  afterEach(async () => {
    vi.restoreAllMocks();
    await resetIndexedDb();
  });

  // The room list shows a room only while its membership is held, and the memberships are not cached with the rooms, so
  // An offline reload restored the rooms and showed none of them. Both are restored at their versions here, and the list
  // Is the one the reader saw online
  test("an offline reload shows the rooms its cache restored, with their memberships", async () => {
    expect.hasAssertions();

    await writeIndexedDb(RoomIndexedDbStoreConfiguration, [room], session.user.id);
    await writeIndexedDb(UserToRoomIndexedDbStoreConfiguration, [userToRoom], session.user.id);
    await mountCache();
    await flushCache();
    const { rooms } = storeToRefs(useRoomStore());

    expect(rooms.value.map(({ id }) => id)).toStrictEqual([room.id]);
  });
});
