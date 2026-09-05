// @vitest-environment nuxt
import type { BanInMessageWithRelations, User } from "@esposter/db-schema";

import { createUser } from "@/services/message/user/createUser.test";
import { setupMswTrpc, trpcMsw } from "@/services/trpc/mswTrpc.test";
import { useBanStore } from "@/store/message/user/ban";
import { TRPCError } from "@trpc/server";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, test } from "vitest";

describe(useBanStore, () => {
  const server = setupMswTrpc();
  const roomId = crypto.randomUUID();
  const first = createUser({ name: "first" });
  const second = createUser({ name: "second" });
  const createBan = (user: User): BanInMessageWithRelations => ({
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
    setActivePinia(createPinia());
  });

  // Each ban is its own target, so two unbans overlap on one list and the failing one must put back only the
  // Ban it lifted — someone re-banned locally stays that way until the list is read again
  test("puts back only the ban whose unban was rejected", async () => {
    expect.hasAssertions();

    server.use(
      trpcMsw.message.moderation.deleteBan.mutation(({ input }) => {
        if (input.userId === first.id) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "error" });
      }),
    );
    const banStore = useBanStore();
    const { items } = storeToRefs(banStore);
    const { deleteBan } = banStore;
    items.value = [createBan(first), createBan(second)];
    await Promise.all([deleteBan({ roomId, userId: first.id }), deleteBan({ roomId, userId: second.id })]);

    expect(items.value.map(({ userId }) => userId)).toStrictEqual([first.id]);
  });
});
