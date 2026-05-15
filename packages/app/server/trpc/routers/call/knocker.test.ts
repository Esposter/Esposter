import type { Context } from "@@/server/trpc/context";
import type { TRPCRouter } from "@@/server/trpc/routers";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { createId } from "#shared/util/math/random/createId";
import { callAdmittedParticipantMap } from "@@/server/services/message/call/callAdmittedParticipantMap";
import { callKnockerMap } from "@@/server/services/message/call/callKnockerMap";
import { callSessionParticipantMap } from "@@/server/services/message/call/callParticipantMap";
import { createParticipant } from "@@/server/services/message/call/createParticipant";
import { callEventEmitter } from "@@/server/services/message/events/callEventEmitter";
import { createCallerFactory } from "@@/server/trpc";
import { createMockContext, getMockSession, mockSessionOnce, replayMockSession } from "@@/server/trpc/context.test";
import { callRouter } from "@@/server/trpc/routers/call";
import { knockerRouter } from "@@/server/trpc/routers/call/knocker";
import { CALL_ID_LENGTH, callSessionsInMessage, DatabaseEntityType, roomsInMessage } from "@esposter/db-schema";
import { ForbiddenError, NotFoundError } from "@esposter/shared";
import { afterEach, beforeAll, describe, expect, test, vi } from "vitest";

describe("call/knocker", () => {
  let mockContext: Context;
  let callSessionCaller: DecorateRouterRecord<TRPCRouter["callSession"]>;
  let knockerCaller: DecorateRouterRecord<TRPCRouter["callSession"]["knocker"]>;
  const nonExistentCallSessionId = createId(CALL_ID_LENGTH);

  beforeAll(async () => {
    mockContext = await createMockContext();
    callSessionCaller = createCallerFactory(callRouter)(mockContext);
    knockerCaller = createCallerFactory(knockerRouter)(mockContext);
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

    test("non-existent call id throws NOT_FOUND", async () => {
      expect.hasAssertions();

      await expect(
        knockerCaller.knockCall({ id: nonExistentCallSessionId }),
      ).rejects.toThrowErrorMatchingInlineSnapshot(
        `[TRPCError: ${new NotFoundError(DatabaseEntityType.CallSession, nonExistentCallSessionId).message}]`,
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
    test("call creator admits knocker — moves knocker to admitted map and emits event", async () => {
      expect.hasAssertions();

      const creatorPayload = getMockSession();
      const { callSessionId } = await callSessionCaller.createCall();
      const { session: knockerSession } = await mockSessionOnce(mockContext.db);
      await knockerCaller.knockCall({ id: callSessionId });
      callSessionParticipantMap.set(
        callSessionId,
        new Map([[creatorPayload.session.id, createParticipant(creatorPayload.session, creatorPayload.user)]]),
      );
      const emitSpy = vi.spyOn(callEventEmitter, "emit");
      replayMockSession(creatorPayload);

      await knockerCaller.admitKnocker({ callSessionId, sessionId: knockerSession.id });

      expect(callKnockerMap.get(callSessionId)?.has(knockerSession.id)).toBe(false);
      expect(callAdmittedParticipantMap.get(callSessionId)?.has(knockerSession.id)).toBe(true);
      expect(emitSpy).toHaveBeenCalledWith("knockerAdmitted", { callSessionId, knockerSessionId: knockerSession.id });
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

    test("non-creator participant throws FORBIDDEN", async () => {
      expect.hasAssertions();

      const { callSessionId } = await callSessionCaller.createCall();
      const { session: knockerSession } = await mockSessionOnce(mockContext.db);
      await knockerCaller.knockCall({ id: callSessionId });
      const nonCreatorPayload = await mockSessionOnce(mockContext.db);
      callSessionParticipantMap.set(
        callSessionId,
        new Map([[nonCreatorPayload.session.id, createParticipant(nonCreatorPayload.session, nonCreatorPayload.user)]]),
      );
      replayMockSession(nonCreatorPayload);

      await expect(
        knockerCaller.admitKnocker({ callSessionId, sessionId: knockerSession.id }),
      ).rejects.toThrowErrorMatchingInlineSnapshot(
        `[TRPCError: ${new ForbiddenError("Must be call creator to admit knockers").message}]`,
      );
    });

    test("non-existent call throws NOT_FOUND", async () => {
      expect.hasAssertions();

      const sessionPayload = await mockSessionOnce(mockContext.db, getMockSession().user);
      callSessionParticipantMap.set(
        nonExistentCallSessionId,
        new Map([[sessionPayload.session.id, createParticipant(sessionPayload.session, sessionPayload.user)]]),
      );
      replayMockSession(sessionPayload);

      await expect(
        knockerCaller.admitKnocker({ callSessionId: nonExistentCallSessionId, sessionId: crypto.randomUUID() }),
      ).rejects.toThrowErrorMatchingInlineSnapshot(
        `[TRPCError: ${new NotFoundError(DatabaseEntityType.CallSession, nonExistentCallSessionId).message}]`,
      );
    });
  });

  describe("dismissKnocker", () => {
    test("call creator dismisses knocker — removes knocker and emits event", async () => {
      expect.hasAssertions();

      const creatorPayload = getMockSession();
      const { callSessionId } = await callSessionCaller.createCall();
      const { session: knockerSession } = await mockSessionOnce(mockContext.db);
      await knockerCaller.knockCall({ id: callSessionId });
      callSessionParticipantMap.set(
        callSessionId,
        new Map([[creatorPayload.session.id, createParticipant(creatorPayload.session, creatorPayload.user)]]),
      );
      const emitSpy = vi.spyOn(callEventEmitter, "emit");
      replayMockSession(creatorPayload);

      await knockerCaller.dismissKnocker({ callSessionId, sessionId: knockerSession.id });

      expect(callKnockerMap.get(callSessionId)?.has(knockerSession.id)).toBe(false);
      expect(emitSpy).toHaveBeenCalledWith("knockerDismissed", { callSessionId, knockerSessionId: knockerSession.id });
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

    test("non-creator participant throws FORBIDDEN", async () => {
      expect.hasAssertions();

      const { callSessionId } = await callSessionCaller.createCall();
      const { session: knockerSession } = await mockSessionOnce(mockContext.db);
      await knockerCaller.knockCall({ id: callSessionId });
      const nonCreatorPayload = await mockSessionOnce(mockContext.db);
      callSessionParticipantMap.set(
        callSessionId,
        new Map([[nonCreatorPayload.session.id, createParticipant(nonCreatorPayload.session, nonCreatorPayload.user)]]),
      );
      replayMockSession(nonCreatorPayload);

      await expect(
        knockerCaller.dismissKnocker({ callSessionId, sessionId: knockerSession.id }),
      ).rejects.toThrowErrorMatchingInlineSnapshot(
        `[TRPCError: ${new ForbiddenError("Must be call creator to dismiss knockers").message}]`,
      );
    });

    test("non-existent call throws NOT_FOUND", async () => {
      expect.hasAssertions();

      const sessionPayload = await mockSessionOnce(mockContext.db, getMockSession().user);
      callSessionParticipantMap.set(
        nonExistentCallSessionId,
        new Map([[sessionPayload.session.id, createParticipant(sessionPayload.session, sessionPayload.user)]]),
      );
      replayMockSession(sessionPayload);

      await expect(
        knockerCaller.dismissKnocker({ callSessionId: nonExistentCallSessionId, sessionId: crypto.randomUUID() }),
      ).rejects.toThrowErrorMatchingInlineSnapshot(
        `[TRPCError: ${new NotFoundError(DatabaseEntityType.CallSession, nonExistentCallSessionId).message}]`,
      );
    });
  });
});
