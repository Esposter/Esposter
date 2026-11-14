// @vitest-environment nuxt
import type { BanInRoom } from "#shared/models/db/room/BanInRoom";
import type { MemberInRoom } from "#shared/models/db/room/MemberInRoom";

import { setCurrentRoomId } from "@/services/message/room/setCurrentRoomId.test";
import { createUser } from "@/services/message/user/createUser.test";
import { setupMswTrpc } from "@/services/trpc/mswTrpc.test";
import { useBanStore } from "@/store/message/user/ban";
import { TRPCError } from "@trpc/server";
import { v7 } from "uuid";
import { beforeEach, describe, expect, test } from "vitest";

describe(useBanStore, () => {
  const { trpcMsw } = setupMswTrpc();
  const roomId = v7();
  const otherRoomId = v7();
  const first = { ...createUser({ name: "first" }), displayName: "first" };
  const second = { ...createUser({ name: "second" }), displayName: "second" };
  const createBan = (user: MemberInRoom): BanInRoom => ({
    bannedByUser: null,
    bannedByUserId: null,
    createdAt: new Date(0),
    deletedAt: null,
    roomId,
    updatedAt: new Date(0),
    user,
    userId: user.id,
  });

  beforeEach(() => {
    setCurrentRoomId(roomId);
  });

  // Each ban is its own target, so two unbans overlap on one list and the failing one must put back only the
  // Ban it lifted — someone re-banned locally stays that way until the list is read again
  test("puts back only the ban whose unban was rejected", async () => {
    expect.hasAssertions();

    trpcMsw.message.moderation.deleteBan.mutation(({ input }) => {
      if (input.userId === first.id) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: " " });
    });
    const banStore = useBanStore();
    const { items } = storeToRefs(banStore);
    const { deleteBan, getSlice } = banStore;
    getSlice(roomId).items.value = [createBan(first), createBan(second)];
    await Promise.all([deleteBan({ roomId, userId: first.id }), deleteBan({ roomId, userId: second.id })]);

    expect(items.value.map(({ userId }) => userId)).toStrictEqual([first.id]);
  });

  // The Bans panel can load another room's bans while an unban is in flight, so a rejected unban goes back under the
  // Room it lifted the ban from, and the room on screen since then keeps only its own bans
  test("puts a rejected unban back under its own room, not the room scoped since", async () => {
    expect.hasAssertions();

    trpcMsw.message.moderation.deleteBan.mutation(() => {
      setCurrentRoomId(otherRoomId);
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: " " });
    });
    const banStore = useBanStore();
    const { items } = storeToRefs(banStore);
    const { deleteBan, getSlice } = banStore;
    getSlice(roomId).items.value = [createBan(first)];
    await deleteBan({ roomId, userId: first.id });

    expect(items.value).toStrictEqual([]);
    expect(getSlice(roomId).items.value).toStrictEqual([createBan(first)]);
  });
});
