// @vitest-environment nuxt
import { TOPICS_HEADER } from "#shared/services/realtime/constants";
import { formatTopicsHeaderValue } from "#shared/services/realtime/formatTopicsHeaderValue";
import { goOnline } from "#src/composables/shared/network.test";
import { createUser } from "#src/services/message/user/createUser.test";
import { getLastOpenRealtimeSocketCall } from "#src/services/realtime/openRealtimeSocket.test";
import { setupMswTrpc } from "#src/services/trpc/mswTrpc.test";
import { useUserStore } from "#src/store/message/user/index";
import { useConnectionStore } from "#src/store/realtime/connection";
import { setRouteId } from "#src/util/router/setRouteId.test";
import { getTopic, TopicKind } from "@esposter/db-schema";
import { waitForSynchronizedFunctions } from "@esposter/shared";
import { v7 } from "uuid";
import { describe, expect, test, vi } from "vitest";

vi.mock(
  import("#src/services/realtime/openRealtimeSocket"),
  () => import("#src/services/realtime/openRealtimeSocket.test"),
);

describe(useRoomUserSubscribables, () => {
  const { trpcMsw } = setupMswTrpc();
  const roomId = v7();
  const readAt = 0;
  const topic = getTopic(TopicKind.Room, roomId);
  const user = createUser();

  // The room's copy of the member changes only through the store's own write, so each read is awaited on that write
  const whenDisplayName = (displayName: string) => {
    const userStore = useUserStore();
    const { getRoomMemberMap } = userStore;
    const { promise, resolve } = Promise.withResolvers<void>();
    const stopWatch = watch(
      () => getRoomMemberMap(roomId)?.get(user.id)?.displayName,
      (newDisplayName) => {
        if (newDisplayName !== displayName) return;

        stopWatch();
        resolve();
      },
    );
    return promise;
  };

  // A member's rename is published on the topic of each room they are in, so the open room's users are read again and
  // The name on screen follows the account
  test("reads the room's users again when a topic its answer names is published", async () => {
    expect.hasAssertions();

    const userStore = useUserStore();
    const { getRoomMemberMap, storeRoomMembers, storeUsers } = userStore;
    storeUsers([user]);
    storeRoomMembers(roomId, [{ ...user, displayName: "staleAccount" }]);
    const connectionStore = useConnectionStore();
    const { openUser } = connectionStore;
    openUser();
    const [, onFrame] = getLastOpenRealtimeSocketCall();
    let displayName = user.name;
    trpcMsw.room.readUsersByIds.query(({ ctx }) => {
      ctx.responseHeaders.set(
        TOPICS_HEADER,
        formatTopicsHeaderValue("room.readUsersByIds", { readAt, signature: "", topics: [{ topic }] }),
      );
      return [{ ...user, displayName, isMember: true }];
    });
    goOnline();
    const scope = effectScope();
    scope.run(() => {
      useRoomUserSubscribables();
    });
    // A subscription is established when its room changes, so the room is opened once the subscribable is listening
    setRouteId(roomId);
    await whenDisplayName(user.name);
    displayName = "renamedAccount";
    onFrame?.(JSON.stringify({ data: { topic }, type: "invalidate" }));
    await waitForSynchronizedFunctions();
    scope.stop();

    expect(getRoomMemberMap(roomId)?.get(user.id)?.displayName).toBe("renamedAccount");
  });
});
