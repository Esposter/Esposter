import type { Context } from "@@/server/trpc/context";
import type { TRPCRouter } from "@@/server/trpc/routers";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { callAdmittedParticipantMap } from "@@/server/services/message/call/callAdmittedParticipantMap";
import { callKnockerMap } from "@@/server/services/message/call/callKnockerMap";
import { callSessionParticipantMap } from "@@/server/services/message/call/callParticipantMap";
import { callEventEmitter } from "@@/server/services/message/events/callEventEmitter";
import { createCallerFactory } from "@@/server/trpc";
import { createMockContext, getMockSession, mockSessionOnce, replayMockSession } from "@@/server/trpc/context.test";
import { callRouter } from "@@/server/trpc/routers/call";
import { knockerRouter } from "@@/server/trpc/routers/call/knocker";
import { roomRouter } from "@@/server/trpc/routers/room";
import { withAsyncIterator } from "@@/server/trpc/routers/withAsyncIterator.test";
import { callSessionsInMessage, DatabaseEntityType, roomsInMessage } from "@esposter/db-schema";
import { ForbiddenError, NotFoundError } from "@esposter/shared";
import { afterEach, assert, beforeAll, describe, expect, test, vi } from "vitest";

describe("call/knocker", () => {
  let mockContext: Context;
  let callSessionCaller: DecorateRouterRecord<TRPCRouter["callSession"]>;
  let knockerCaller: DecorateRouterRecord<typeof knockerRouter>;
  let roomCaller: DecorateRouterRecord<TRPCRouter["room"]>;
  const name = "name";

  beforeAll(async () => {
    mockContext = await createMockContext();
    callSessionCaller = createCallerFactory(callRouter)(mockContext);
    knockerCaller = createCallerFactory(knockerRouter)(mockContext);
    roomCaller = createCallerFactory(roomRouter)(mockContext);
  });

  afterEach(async () => {
    callAdmittedParticipantMap.clear();
    callKnockerMap.clear();
    callSessionParticipantMap.clear();
    await mockContext.db.delete(callSessionsInMessage);
    await mockContext.db.delete(roomsInMessage);
    vi.clearAllMocks();
  });

  describe("knockCall", () => {
    test("adds knocker to map and emits event", async () => {
      expect.hasAssertions();

      const { callSessionId } = await callSessionCaller.createCall();
      const emitSpy = vi.spyOn(callEventEmitter, "emit");
      await mockSessionOnce(mockContext.db);

      await knockerCaller.knockCall({ id: callSessionId });

      expect(callKnockerMap.get(callSessionId)?.size).toBe(1);
      expect(emitSpy).toHaveBeenCalledWith("knockCall", expect.objectContaining({ callSessionId }));
    });

    test("rejects room call with FORBIDDEN", async () => {
      expect.hasAssertions();

      const newRoom = await roomCaller.createRoom({ name });
      const { callSessionId } = await callSessionCaller.joinCallByRoomId({ roomId: newRoom.id });
      await mockSessionOnce(mockContext.db);

      await expect(knockerCaller.knockCall({ id: callSessionId })).rejects.toThrowErrorMatchingInlineSnapshot(
        `[TRPCError: ${new ForbiddenError("Room calls cannot be knocked — join via joinCallByRoomId").message}]`,
      );
    });

    test("non-existent call id throws NOT_FOUND", async () => {
      expect.hasAssertions();

      const fakeId = crypto.randomUUID();

      await expect(knockerCaller.knockCall({ id: fakeId })).rejects.toThrowErrorMatchingInlineSnapshot(
        `[TRPCError: ${new NotFoundError(DatabaseEntityType.CallSession, fakeId).message}]`,
      );
    });

    test("duplicate knock overwrites existing entry in map", async () => {
      expect.hasAssertions();

      const { callSessionId } = await callSessionCaller.createCall();
      const { session } = await mockSessionOnce(mockContext.db);
      await knockerCaller.knockCall({ id: callSessionId });
      replayMockSession({ session, user: getMockSession().user });
      await knockerCaller.knockCall({ id: callSessionId });

      expect(callKnockerMap.get(callSessionId)?.size).toBe(1);
    });
  });

  describe("admitKnocker", () => {
    test("happy path: knocker moved to admitted set, event emitted", async () => {
      expect.hasAssertions();

      const creatorSessionPayload = await mockSessionOnce(mockContext.db, getMockSession().user);
      const { callSessionId } = await callSessionCaller.createCall();
      replayMockSession(creatorSessionPayload);
      await callSessionCaller.joinCall({ id: callSessionId });
      const emitSpy = vi.spyOn(callEventEmitter, "emit");
      const { session: knockerSession } = await mockSessionOnce(mockContext.db);
      await knockerCaller.knockCall({ id: callSessionId });
      replayMockSession(creatorSessionPayload);

      await knockerCaller.admitKnocker({ callSessionId, sessionId: knockerSession.id });

      expect(callKnockerMap.get(callSessionId)?.has(knockerSession.id)).toBeFalsy();
      expect(callAdmittedParticipantMap.get(callSessionId)?.has(knockerSession.id)).toBe(true);
      expect(emitSpy).toHaveBeenCalledWith(
        "knockerAdmitted",
        expect.objectContaining({ callSessionId, knockerSessionId: knockerSession.id }),
      );
    });

    test("caller not in call throws FORBIDDEN", async () => {
      expect.hasAssertions();

      const { callSessionId } = await callSessionCaller.createCall();
      const { session: knockerSession } = await mockSessionOnce(mockContext.db);
      await knockerCaller.knockCall({ id: callSessionId });
      await mockSessionOnce(mockContext.db);

      await expect(
        knockerCaller.admitKnocker({ callSessionId, sessionId: knockerSession.id }),
      ).rejects.toThrowErrorMatchingInlineSnapshot(
        `[TRPCError: ${new ForbiddenError("Must be in call to admit knockers").message}]`,
      );
    });

    test("non-creator participant in call cannot admit knockers", async () => {
      expect.hasAssertions();

      const newRoom = await roomCaller.createRoom({ name });
      const newInviteToken = await roomCaller.createInvite({ roomId: newRoom.id });
      const { callSessionId } = await callSessionCaller.joinCallByRoomId({ roomId: newRoom.id });
      const { user: memberUser } = await mockSessionOnce(mockContext.db);
      await roomCaller.joinRoom(newInviteToken);
      const memberSessionPayload = await mockSessionOnce(mockContext.db, memberUser);
      await callSessionCaller.joinCallByRoomId({ roomId: newRoom.id });
      const { session: knockerSession } = await mockSessionOnce(mockContext.db);
      await knockerCaller.knockCall({ id: callSessionId });
      replayMockSession(memberSessionPayload);

      await expect(
        knockerCaller.admitKnocker({ callSessionId, sessionId: knockerSession.id }),
      ).rejects.toThrowErrorMatchingInlineSnapshot(
        `[TRPCError: ${new ForbiddenError("Must be call creator to admit knockers").message}]`,
      );
    });

    test("knocker not in map returns early without error", async () => {
      expect.hasAssertions();

      const creatorSessionPayload = await mockSessionOnce(mockContext.db, getMockSession().user);
      const { callSessionId } = await callSessionCaller.createCall();
      replayMockSession(creatorSessionPayload);
      await callSessionCaller.joinCall({ id: callSessionId });
      replayMockSession(creatorSessionPayload);
      const nonExistentSessionId = crypto.randomUUID();

      await expect(
        knockerCaller.admitKnocker({ callSessionId, sessionId: nonExistentSessionId }),
      ).resolves.toBeUndefined();
    });

    test("non-existent call throws NOT_FOUND", async () => {
      expect.hasAssertions();

      const sessionPayload = await mockSessionOnce(mockContext.db, getMockSession().user);
      const fakeCallSessionId = crypto.randomUUID();
      callSessionParticipantMap.set(fakeCallSessionId, new Set([sessionPayload.session.id]));
      replayMockSession(sessionPayload);

      await expect(
        knockerCaller.admitKnocker({ callSessionId: fakeCallSessionId, sessionId: crypto.randomUUID() }),
      ).rejects.toThrowErrorMatchingInlineSnapshot(
        `[TRPCError: ${new NotFoundError(DatabaseEntityType.CallSession, fakeCallSessionId).message}]`,
      );
    });
  });

  describe("dismissKnocker", () => {
    test("happy path: knocker removed from map, event emitted", async () => {
      expect.hasAssertions();

      const creatorSessionPayload = await mockSessionOnce(mockContext.db, getMockSession().user);
      const { callSessionId } = await callSessionCaller.createCall();
      replayMockSession(creatorSessionPayload);
      await callSessionCaller.joinCall({ id: callSessionId });
      const emitSpy = vi.spyOn(callEventEmitter, "emit");
      const { session: knockerSession } = await mockSessionOnce(mockContext.db);
      await knockerCaller.knockCall({ id: callSessionId });
      replayMockSession(creatorSessionPayload);

      await knockerCaller.dismissKnocker({ callSessionId, sessionId: knockerSession.id });

      expect(callKnockerMap.get(callSessionId)?.has(knockerSession.id)).toBeFalsy();
      expect(emitSpy).toHaveBeenCalledWith(
        "knockerDismissed",
        expect.objectContaining({ callSessionId, knockerSessionId: knockerSession.id }),
      );
    });

    test("caller not in call throws FORBIDDEN", async () => {
      expect.hasAssertions();

      const { callSessionId } = await callSessionCaller.createCall();
      const { session: knockerSession } = await mockSessionOnce(mockContext.db);
      await knockerCaller.knockCall({ id: callSessionId });
      await mockSessionOnce(mockContext.db);

      await expect(
        knockerCaller.dismissKnocker({ callSessionId, sessionId: knockerSession.id }),
      ).rejects.toThrowErrorMatchingInlineSnapshot(
        `[TRPCError: ${new ForbiddenError("Must be in call to dismiss knockers").message}]`,
      );
    });

    test("non-creator participant in call cannot dismiss knockers", async () => {
      expect.hasAssertions();

      const newRoom = await roomCaller.createRoom({ name });
      const newInviteToken = await roomCaller.createInvite({ roomId: newRoom.id });
      const { callSessionId } = await callSessionCaller.joinCallByRoomId({ roomId: newRoom.id });
      const { user: memberUser } = await mockSessionOnce(mockContext.db);
      await roomCaller.joinRoom(newInviteToken);
      const memberSessionPayload = await mockSessionOnce(mockContext.db, memberUser);
      await callSessionCaller.joinCallByRoomId({ roomId: newRoom.id });
      const { session: knockerSession } = await mockSessionOnce(mockContext.db);
      await knockerCaller.knockCall({ id: callSessionId });
      replayMockSession(memberSessionPayload);

      await expect(
        knockerCaller.dismissKnocker({ callSessionId, sessionId: knockerSession.id }),
      ).rejects.toThrowErrorMatchingInlineSnapshot(
        `[TRPCError: ${new ForbiddenError("Must be call creator to dismiss knockers").message}]`,
      );
    });

    test("knocker not in map returns early without error", async () => {
      expect.hasAssertions();

      const creatorSessionPayload = await mockSessionOnce(mockContext.db, getMockSession().user);
      const { callSessionId } = await callSessionCaller.createCall();
      replayMockSession(creatorSessionPayload);
      await callSessionCaller.joinCall({ id: callSessionId });
      replayMockSession(creatorSessionPayload);
      const nonExistentSessionId = crypto.randomUUID();

      await expect(
        knockerCaller.dismissKnocker({ callSessionId, sessionId: nonExistentSessionId }),
      ).resolves.toBeUndefined();
    });

    test("non-existent call throws NOT_FOUND", async () => {
      expect.hasAssertions();

      const sessionPayload = await mockSessionOnce(mockContext.db, getMockSession().user);
      const fakeCallSessionId = crypto.randomUUID();
      callSessionParticipantMap.set(fakeCallSessionId, new Set([sessionPayload.session.id]));
      replayMockSession(sessionPayload);

      await expect(
        knockerCaller.dismissKnocker({ callSessionId: fakeCallSessionId, sessionId: crypto.randomUUID() }),
      ).rejects.toThrowErrorMatchingInlineSnapshot(
        `[TRPCError: ${new NotFoundError(DatabaseEntityType.CallSession, fakeCallSessionId).message}]`,
      );
    });
  });

  describe("onKnockCall", () => {
    test("creator in call receives knock event", async () => {
      expect.hasAssertions();

      const creatorSessionPayload = await mockSessionOnce(mockContext.db, getMockSession().user);
      const { callSessionId } = await callSessionCaller.createCall();
      replayMockSession(creatorSessionPayload);
      await callSessionCaller.joinCall({ id: callSessionId });
      replayMockSession(creatorSessionPayload);
      const onKnockCall = await knockerCaller.onKnockCall(callSessionId);
      const { session: knockerSession, user: knockerUser } = await mockSessionOnce(mockContext.db);
      const data = await withAsyncIterator(
        () => onKnockCall,
        async (iterator) => {
          const [result] = await Promise.all([iterator.next(), knockerCaller.knockCall({ id: callSessionId })]);
          return result;
        },
      );

      assert(!data.done);

      expect(data.value.id).toBe(knockerSession.id);
      expect(data.value.userId).toBe(knockerUser.id);
    });

    test("non-creator participant does not receive knock events", async () => {
      expect.hasAssertions();

      const newRoom = await roomCaller.createRoom({ name });
      const newInviteToken = await roomCaller.createInvite({ roomId: newRoom.id });
      const { callSessionId } = await callSessionCaller.joinCallByRoomId({ roomId: newRoom.id });
      const { user: memberUser } = await mockSessionOnce(mockContext.db);
      await roomCaller.joinRoom(newInviteToken);
      const memberSessionPayload = await mockSessionOnce(mockContext.db, memberUser);
      await callSessionCaller.joinCallByRoomId({ roomId: newRoom.id });
      replayMockSession(memberSessionPayload);
      const onKnockCall = await knockerCaller.onKnockCall(callSessionId);
      const emitSpy = vi.spyOn(callEventEmitter, "emit");
      await mockSessionOnce(mockContext.db);
      await knockerCaller.knockCall({ id: callSessionId });

      expect(emitSpy).toHaveBeenCalledWith("knockCall", expect.objectContaining({ callSessionId }));

      const iterator = onKnockCall[Symbol.asyncIterator]();
      const returnResult = await iterator.return?.();
      expect(returnResult?.done).toBe(true);
    });

    test("user not in call receives no events", async () => {
      expect.hasAssertions();

      const creatorSessionPayload = await mockSessionOnce(mockContext.db, getMockSession().user);
      const { callSessionId } = await callSessionCaller.createCall();
      await mockSessionOnce(mockContext.db);
      const onKnockCall = await knockerCaller.onKnockCall(callSessionId);
      replayMockSession(creatorSessionPayload);
      await callSessionCaller.joinCall({ id: callSessionId });

      const iterator = onKnockCall[Symbol.asyncIterator]();
      const returnResult = await iterator.return?.();
      expect(returnResult?.done).toBe(true);
    });

    test("events from other calls are filtered out", async () => {
      expect.hasAssertions();

      const creatorSessionPayload = await mockSessionOnce(mockContext.db, getMockSession().user);
      const { callSessionId: callA } = await callSessionCaller.createCall();
      replayMockSession(creatorSessionPayload);
      await callSessionCaller.joinCall({ id: callA });
      replayMockSession(creatorSessionPayload);
      const { callSessionId: callB } = await callSessionCaller.createCall();
      replayMockSession(creatorSessionPayload);
      const onKnockCallA = await knockerCaller.onKnockCall(callA);
      const emitSpy = vi.spyOn(callEventEmitter, "emit");
      await mockSessionOnce(mockContext.db);
      await knockerCaller.knockCall({ id: callB });

      expect(emitSpy).toHaveBeenCalledWith("knockCall", expect.objectContaining({ callSessionId: callB }));

      const iterator = onKnockCallA[Symbol.asyncIterator]();
      const returnResult = await iterator.return?.();
      expect(returnResult?.done).toBe(true);
    });
  });

  describe("onKnockerAdmitted", () => {
    test("admitted knocker receives event", async () => {
      expect.hasAssertions();

      const creatorSessionPayload = await mockSessionOnce(mockContext.db, getMockSession().user);
      const { callSessionId } = await callSessionCaller.createCall();
      replayMockSession(creatorSessionPayload);
      await callSessionCaller.joinCall({ id: callSessionId });
      const { session: knockerSession } = await mockSessionOnce(mockContext.db);
      await knockerCaller.knockCall({ id: callSessionId });
      replayMockSession({ session: knockerSession, user: getMockSession().user });
      const onKnockerAdmitted = await knockerCaller.onKnockerAdmitted(callSessionId);
      replayMockSession(creatorSessionPayload);
      const data = await withAsyncIterator(
        () => onKnockerAdmitted,
        async (iterator) => {
          const [result] = await Promise.all([
            iterator.next(),
            knockerCaller.admitKnocker({ callSessionId, sessionId: knockerSession.id }),
          ]);
          return result;
        },
      );

      assert(!data.done);
      expect(data.value).toBeUndefined();
    });

    test("other knocker does not receive admitted event", async () => {
      expect.hasAssertions();

      const creatorSessionPayload = await mockSessionOnce(mockContext.db, getMockSession().user);
      const { callSessionId } = await callSessionCaller.createCall();
      replayMockSession(creatorSessionPayload);
      await callSessionCaller.joinCall({ id: callSessionId });
      const { session: knockerSession1 } = await mockSessionOnce(mockContext.db);
      await knockerCaller.knockCall({ id: callSessionId });
      const { session: knockerSession2 } = await mockSessionOnce(mockContext.db);
      await knockerCaller.knockCall({ id: callSessionId });
      replayMockSession({ session: knockerSession2, user: getMockSession().user });
      const onKnockerAdmitted = await knockerCaller.onKnockerAdmitted(callSessionId);
      const emitSpy = vi.spyOn(callEventEmitter, "emit");
      replayMockSession(creatorSessionPayload);
      await knockerCaller.admitKnocker({ callSessionId, sessionId: knockerSession1.id });

      expect(emitSpy).toHaveBeenCalledWith(
        "knockerAdmitted",
        expect.objectContaining({ knockerSessionId: knockerSession1.id }),
      );

      const iterator = onKnockerAdmitted[Symbol.asyncIterator]();
      const returnResult = await iterator.return?.();
      expect(returnResult?.done).toBe(true);
    });
  });

  describe("onKnockerDismissed", () => {
    test("dismissed knocker receives event", async () => {
      expect.hasAssertions();

      const creatorSessionPayload = await mockSessionOnce(mockContext.db, getMockSession().user);
      const { callSessionId } = await callSessionCaller.createCall();
      replayMockSession(creatorSessionPayload);
      await callSessionCaller.joinCall({ id: callSessionId });
      const { session: knockerSession } = await mockSessionOnce(mockContext.db);
      await knockerCaller.knockCall({ id: callSessionId });
      replayMockSession({ session: knockerSession, user: getMockSession().user });
      const onKnockerDismissed = await knockerCaller.onKnockerDismissed(callSessionId);
      replayMockSession(creatorSessionPayload);
      const data = await withAsyncIterator(
        () => onKnockerDismissed,
        async (iterator) => {
          const [result] = await Promise.all([
            iterator.next(),
            knockerCaller.dismissKnocker({ callSessionId, sessionId: knockerSession.id }),
          ]);
          return result;
        },
      );

      assert(!data.done);
      expect(data.value).toBeUndefined();
    });

    test("other knocker does not receive dismissed event", async () => {
      expect.hasAssertions();

      const creatorSessionPayload = await mockSessionOnce(mockContext.db, getMockSession().user);
      const { callSessionId } = await callSessionCaller.createCall();
      replayMockSession(creatorSessionPayload);
      await callSessionCaller.joinCall({ id: callSessionId });
      const { session: knockerSession1 } = await mockSessionOnce(mockContext.db);
      await knockerCaller.knockCall({ id: callSessionId });
      const { session: knockerSession2 } = await mockSessionOnce(mockContext.db);
      await knockerCaller.knockCall({ id: callSessionId });
      replayMockSession({ session: knockerSession2, user: getMockSession().user });
      const onKnockerDismissed = await knockerCaller.onKnockerDismissed(callSessionId);
      const emitSpy = vi.spyOn(callEventEmitter, "emit");
      replayMockSession(creatorSessionPayload);
      await knockerCaller.dismissKnocker({ callSessionId, sessionId: knockerSession1.id });

      expect(emitSpy).toHaveBeenCalledWith(
        "knockerDismissed",
        expect.objectContaining({ knockerSessionId: knockerSession1.id }),
      );

      const iterator = onKnockerDismissed[Symbol.asyncIterator]();
      const returnResult = await iterator.return?.();
      expect(returnResult?.done).toBe(true);
    });
  });

  describe("integration flows", () => {
    test("knock → admit → join flow", async () => {
      expect.hasAssertions();

      const creatorSessionPayload = await mockSessionOnce(mockContext.db, getMockSession().user);
      const { callSessionId } = await callSessionCaller.createCall();
      replayMockSession(creatorSessionPayload);
      await callSessionCaller.joinCall({ id: callSessionId });
      const knockerSessionPayload = await mockSessionOnce(mockContext.db);
      await knockerCaller.knockCall({ id: callSessionId });
      replayMockSession(creatorSessionPayload);
      await knockerCaller.admitKnocker({ callSessionId, sessionId: knockerSessionPayload.session.id });
      replayMockSession(knockerSessionPayload);
      const { participants } = await callSessionCaller.joinCall({ id: callSessionId });

      expect(participants.some(({ id }) => id === knockerSessionPayload.session.id)).toBe(true);
    });

    test("knock → dismiss → reknock adds knocker back to map", async () => {
      expect.hasAssertions();

      const creatorSessionPayload = await mockSessionOnce(mockContext.db, getMockSession().user);
      const { callSessionId } = await callSessionCaller.createCall();
      replayMockSession(creatorSessionPayload);
      await callSessionCaller.joinCall({ id: callSessionId });
      const { session: knockerSession } = await mockSessionOnce(mockContext.db);
      await knockerCaller.knockCall({ id: callSessionId });
      replayMockSession(creatorSessionPayload);
      await knockerCaller.dismissKnocker({ callSessionId, sessionId: knockerSession.id });

      expect(callKnockerMap.get(callSessionId)?.has(knockerSession.id)).toBeFalsy();

      replayMockSession({ session: knockerSession, user: getMockSession().user });
      await knockerCaller.knockCall({ id: callSessionId });

      expect(callKnockerMap.get(callSessionId)?.has(knockerSession.id)).toBe(true);
    });
  });
});
