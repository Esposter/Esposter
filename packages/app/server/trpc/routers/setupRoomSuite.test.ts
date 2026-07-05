/* eslint-disable vitest/require-top-level-describe */
import type { Context } from "@@/server/trpc/context";
import type { TRPCRouter } from "@@/server/trpc/routers";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { createCallerFactory } from "@@/server/trpc";
import { createMockContext, mockSessionOnce } from "@@/server/trpc/context.test";
import { roleRouter } from "@@/server/trpc/routers/role";
import { roomRouter } from "@@/server/trpc/routers/room";
import { roomsInMessage } from "@esposter/db-schema";
import { MockTableDatabase } from "azure-mock";
import { afterEach, beforeAll, beforeEach, describe } from "vitest";

// Room-suite fixture: owns the mock context, room/role callers, a fresh room per test, and the
// Standard cleanup. Suite-specific hooks compose — before-hooks run after these, after-hooks before.
export const setupRoomSuite = () => {
  let mockContext: Context;
  let roleCaller: DecorateRouterRecord<TRPCRouter["role"]>;
  let roomCaller: DecorateRouterRecord<TRPCRouter["room"]>;
  let roomId: string;

  beforeAll(async () => {
    mockContext = await createMockContext();
    roleCaller = createCallerFactory(roleRouter)(mockContext);
    roomCaller = createCallerFactory(roomRouter)(mockContext);
  });

  beforeEach(async () => {
    const room = await roomCaller.createRoom({ name: "name" });
    roomId = room.id;
  });

  afterEach(async () => {
    MockTableDatabase.clear();
    await mockContext.db.delete(roomsInMessage);
  });

  const createMember = async () => {
    const inviteCode = await roomCaller.createInvite({ roomId });
    const { user } = await mockSessionOnce(mockContext.db);
    await roomCaller.joinRoom(inviteCode);
    return user;
  };

  const setupMemberWithRole = async (permissions: bigint, position: number) => {
    const member = await createMember();
    const role = await roleCaller.createRole({ name: crypto.randomUUID(), permissions, position, roomId });
    await roleCaller.assignRole({ roleId: role.id, roomId, userId: member.id });
    return { member, role };
  };

  return {
    createMember,
    getMockContext: () => mockContext,
    getRoleCaller: () => roleCaller,
    getRoomCaller: () => roomCaller,
    getRoomId: () => roomId,
    setupMemberWithRole,
  };
};

describe.todo("setupRoomSuite");
