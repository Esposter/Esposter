// @vitest-environment nuxt
import type { MemberCountByTopRole } from "#shared/models/db/room/MemberCountByTopRole";
import type { MemberInRoom } from "#shared/models/db/room/MemberInRoom";
import type { Page } from "@esposter/db-schema";

import { flushCache } from "#src/composables/cache/indexedDb/flushCache.test";
import { goOffline } from "#src/composables/shared/network.test";
import { MemberIndexedDbStoreConfiguration } from "#src/services/cache/indexedDb/configurations/MemberIndexedDbStoreConfiguration";
import { resetIndexedDb } from "#src/services/cache/indexedDb/openIndexedDb";
import { writeIndexedDb } from "#src/services/cache/indexedDb/writeIndexedDb";
import { setCurrentRoomId } from "#src/services/message/room/setCurrentRoomId.test";
import { createUser } from "#src/services/message/user/createUser.test";
import { setupMswTrpc } from "#src/services/trpc/mswTrpc.test";
import { useMemberStore } from "#src/store/message/user/member";
import { createEmptyPage } from "@esposter/db-schema";
import { takeOne } from "@esposter/shared";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { v7 } from "uuid";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

describe(useMemberCache, () => {
  const { trpcMsw } = setupMswTrpc();
  let memberCount: ComputedRef<number | undefined>;
  let memberCountsByTopRole: ComputedRef<MemberCountByTopRole[]>;
  let members: Ref<MemberInRoom[]>;
  let initializeCursorPaginationData: (data: Page<MemberInRoom>) => void;
  let refreshMemberCounts: ReturnType<typeof useMemberStore>["refreshMemberCounts"];
  const partitionKey = v7();
  const secondPartitionKey = v7();
  const user = createUser();
  const member: MemberInRoom = { ...user, displayName: user.name };
  const mountCache = async (initialRouteId: string = partitionKey) => {
    await mountSuspended(
      defineComponent({
        render: () => h("div"),
        setup: () => {
          setCurrentRoomId(initialRouteId);
          const memberStore = useMemberStore();
          ({ memberCount, memberCountsByTopRole, members } = storeToRefs(memberStore));
          ({ initializeCursorPaginationData, refreshMemberCounts } = memberStore);
          useMemberCache();

          onUnmounted(() => {
            initializeCursorPaginationData(createEmptyPage<MemberInRoom>());
          });
        },
      }),
    );
  };

  beforeEach(() => {
    goOffline();
  });

  afterEach(async () => {
    vi.restoreAllMocks();
    await resetIndexedDb();
  });

  // The cache lifecycle itself belongs to usePaginationCache and is tested there for both variants. What only
  // This composable can get wrong is the wiring — the route id it takes as its partition key, and the store
  // Hook it hydrates through — so one end-to-end pass over both is all this suite owes
  test("populates store from cache when switching rooms offline", async () => {
    expect.hasAssertions();

    await writeIndexedDb(MemberIndexedDbStoreConfiguration, [member], secondPartitionKey);
    await mountCache();
    // Both totals are server-computed, so the room left behind is the last thing that set them. Neither can be
    // Refetched offline, and the room being switched into must not inherit either
    trpcMsw.room.readMembersCount.query(() => 1);
    trpcMsw.room.readMemberCountsByTopRole.query(() => [{ count: 1, roleId: v7() }]);
    await refreshMemberCounts([partitionKey]);
    setCurrentRoomId(secondPartitionKey);
    await flushCache();

    expect(members.value).toHaveLength(1);
    expect(memberCount.value).toBeUndefined();
    expect(memberCountsByTopRole.value).toStrictEqual([]);
    expect(takeOne(members.value).id).toStrictEqual(user.id);
  });
});
