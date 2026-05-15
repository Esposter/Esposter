import type { Context } from "@@/server/trpc/context";
import type { TRPCRouter } from "@@/server/trpc/routers";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { callAdmittedParticipantMap } from "@@/server/services/message/call/callAdmittedParticipantMap";
import { callKnockerMap } from "@@/server/services/message/call/callKnockerMap";
import { callSessionParticipantMap } from "@@/server/services/message/call/callParticipantMap";
import { createCallerFactory } from "@@/server/trpc";
import { createMockContext, getMockSession, mockSessionOnce } from "@@/server/trpc/context.test";
import { callRouter } from "@@/server/trpc/routers/call";
import { roomRouter } from "@@/server/trpc/routers/room";
import { callSessionsInMessage, roomsInMessage } from "@esposter/db-schema";
import { ForbiddenError } from "@esposter/shared";
import { afterEach, beforeAll, describe, expect, test, vi } from "vitest";

describe("call", () => {
  let mockContext: Context;
  let callCaller: DecorateRouterRecord<TRPCRouter["callSession"]>;
  let roomCaller: DecorateRouterRecord<TRPCRouter["room"]>;
  const name = "name";

  beforeAll(async () => {
    mockContext = await createMockContext();
    callCaller = createCallerFactory(callRouter)(mockContext);
    roomCaller = createCallerFactory(roomRouter)(mockContext);
  });

  afterEach(async () => {
    callAdmittedParticipantMap.clear();
    callKnockerMap.clear();
    callSessionParticipantMap.clear();
    await mockContext.db.delete(callSessionsInMessage);
    await mockContext.db.delete(roomsInMessage);
    vi.restoreAllMocks();
  });

  test("creates standalone call", async () => {
    expect.hasAssertions();

    const { callSessionId } = await callCaller.createCall();
    const callSession = await mockContext.db.query.callSessionsInMessage.findFirst({
      where: { id: { eq: callSessionId } },
    });

    expect(callSession?.id).toBe(callSessionId);
    expect(callSession?.roomId).toBeNull();
    expect(callSession?.userId).toBe(getMockSession().user.id);
  });

  test("prevents non-creator from directly joining standalone call", async () => {
    expect.hasAssertions();

    const { callSessionId } = await callCaller.createCall();
    await mockSessionOnce(mockContext.db);

    await expect(callCaller.joinCall({ id: callSessionId })).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new ForbiddenError("Must be admitted to join this call").message}]`,
    );
  });

  test("prevents non-participant from reading standalone call participants", async () => {
    expect.hasAssertions();

    const { callSessionId } = await callCaller.createCall();
    await mockSessionOnce(mockContext.db);

    await expect(callCaller.readCallParticipants({ callSessionId })).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new ForbiddenError("Must be in call").message}]`,
    );
  });

  test("fails join for non-member", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    await mockSessionOnce(mockContext.db);

    await expect(callCaller.joinCallByRoomId({ roomId: newRoom.id })).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: UNAUTHORIZED]`,
    );
  });
});
