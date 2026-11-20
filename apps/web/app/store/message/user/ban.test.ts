// @vitest-environment nuxt
import type { BanInRoom } from "#shared/models/db/room/BanInRoom";
import type { MemberInRoom } from "#shared/models/db/room/MemberInRoom";

import { setCurrentRoomId } from "#src/services/message/room/setCurrentRoomId.test";
import { createUser } from "#src/services/message/user/createUser.test";
import { setupMswTrpc } from "#src/services/trpc/mswTrpc.test";
import { useBanStore } from "#src/store/message/user/ban";
import { TRPCError } from "@trpc/server";
import { flushPromises } from "@vue/test-utils";
import { v7 } from "uuid";
import { beforeEach, describe, expect, test } from "vitest";

describe(useBanStore, () => {
  const { trpcMsw } = setupMswTrpc();
  const roomId = v7();
  const first = { ...createUser({ name: "first" }), displayName: "first" };
  const second = { ...createUser({ name: "second" }), displayName: "second" };
  const createBan = (user: MemberInRoom, createdAt = new Date(0)): BanInRoom => ({
    bannedByUser: null,
    bannedByUserId: null,
    createdAt,
    deletedAt: null,
    roomId,
    updatedAt: new Date(0),
    user,
    userId: user.id,
    version: 0,
  });

  beforeEach(() => {
    setCurrentRoomId(roomId);
  });

  // The panel's list is the page's keys, and the rows are the overlay's, so an unban the list draws is the row's removal
  test("drops an unbanned ban from the list before the server answers", async () => {
    expect.hasAssertions();

    const { promise, resolve } = Promise.withResolvers<BanInRoom>();
    trpcMsw.message.moderation.deleteBan.mutation(() => promise);
    const banStore = useBanStore();
    const { items } = storeToRefs(banStore);
    const { deleteBan, getSliceOperationData, readBanPage } = banStore;
    await getSliceOperationData(roomId).readItems(() =>
      Promise.resolve(readBanPage({ items: [createBan(first), createBan(second)], nextCursor: "" })),
    );
    deleteBan({ roomId, userId: first.id });
    await flushPromises();
    const listedWhileInFlight = items.value.map(({ userId }) => userId);
    resolve({ ...createBan(first), deletedAt: new Date(1), version: 1 });
    await flushPromises();

    expect(listedWhileInFlight).toStrictEqual([second.id]);
  });

  // A refused unban restores nothing: the ban the server still holds comes back as the list read it
  test("shows a ban again when its unban is refused", async () => {
    expect.hasAssertions();

    trpcMsw.message.moderation.deleteBan.mutation(() => {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: " " });
    });
    const banStore = useBanStore();
    const { items } = storeToRefs(banStore);
    const { deleteBan, getSliceOperationData, readBanPage } = banStore;
    await getSliceOperationData(roomId).readItems(() =>
      Promise.resolve(readBanPage({ items: [createBan(first), createBan(second)], nextCursor: "" })),
    );
    deleteBan({ roomId, userId: first.id });
    await flushPromises();

    expect(items.value.map(({ userId }) => userId)).toStrictEqual([first.id, second.id]);
  });

  // The page returns a removed ban as a tombstone, so the list reads the removal and the panel never draws the row
  test("hides a ban the page returns as a tombstone", async () => {
    expect.hasAssertions();

    const banStore = useBanStore();
    const { items } = storeToRefs(banStore);
    const { getSliceOperationData, readBanPage } = banStore;
    await getSliceOperationData(roomId).readItems(() =>
      Promise.resolve(
        readBanPage({
          items: [{ ...createBan(first), deletedAt: new Date(1), version: 1 }, createBan(second)],
          nextCursor: "",
        }),
      ),
    );

    expect(items.value.map(({ userId }) => userId)).toStrictEqual([second.id]);
  });
});
