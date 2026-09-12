import type { KnockerInput } from "#shared/models/db/call/KnockerInput";
import type { Context } from "@@/server/trpc/context";
import type { TRPCRouter } from "@@/server/trpc/routers";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { createId } from "#shared/util/math/random/createId";
import { callAdmittedParticipantMap } from "@@/server/services/message/call/callAdmittedParticipantMap";
import { callKnockerMap } from "@@/server/services/message/call/callKnockerMap";
import { deleteCallParticipant } from "@@/server/services/message/call/deleteCallParticipant";
import { callEventEmitter } from "@@/server/services/message/events/callEventEmitter";
import { getMockSession, mockSessionOnce, replayMockSession } from "@@/server/trpc/context.test";
import { setCallParticipant } from "@@/server/trpc/routers/call/setCallParticipant.test";
import { setupCallSuite } from "@@/server/trpc/routers/call/setupCallSuite.test";
import { CALL_ID_LENGTH, DatabaseEntityType } from "@esposter/db-schema";
import { ForbiddenError, NotFoundError } from "@esposter/shared";
import { assert, beforeAll, describe, expect, test, vi } from "vitest";

describe("knockerRouter", () => {
  const { getCallCaller, getMockContext } = setupCallSuite();
  let mockContext: Context;
  let callSessionCaller: DecorateRouterRecord<TRPCRouter["callSession"]>;
  let knockerCaller: DecorateRouterRecord<TRPCRouter["callSession"]["knocker"]>;
  const nonExistentCallSessionId = createId(CALL_ID_LENGTH);
  // Admitting and dismissing share the one doorkeeper guard; the gate whose message does not name the action is
  // Asserted once for both, the two that do stay written out (`testing` skill, error assertions)
  const doorkeeperMutations = [
    { action: "admit", mutate: (input: KnockerInput) => knockerCaller.admitKnocker(input) },
    { action: "dismiss", mutate: (input: KnockerInput) => knockerCaller.dismissKnocker(input) },
  ];

  beforeAll(() => {
    mockContext = getMockContext();
    callSessionCaller = getCallCaller();
    knockerCaller = callSessionCaller.knocker;
  });

  test("knockCall adds the knocker to the map and emits it", async () => {
    expect.hasAssertions();

    const { callSessionId } = await callSessionCaller.createCall();
    const emitSpy = vi.spyOn(callEventEmitter, "emit");
    const { session: knockerSession } = await mockSessionOnce(mockContext.db);

    await knockerCaller.knockCall({ id: callSessionId });

    const knocker = callKnockerMap.get(callSessionId)?.get(knockerSession.id);
    assert.exists(knocker);

    expect(callKnockerMap.get(callSessionId)?.size).toBe(1);
    expect(emitSpy).toHaveBeenCalledExactlyOnceWith("knockCall", {
      callSessionId,
      knocker,
      knockerSessionId: knockerSession.id,
    });
  });

  test("fails knockCall with a non-existent call id", async () => {
    expect.hasAssertions();

    await expect(knockerCaller.knockCall({ id: nonExistentCallSessionId })).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new NotFoundError(DatabaseEntityType.CallSession, nonExistentCallSessionId).message}]`,
    );
  });

  test("knockCall overwrites the existing entry on a duplicate knock", async () => {
    expect.hasAssertions();

    const { callSessionId } = await callSessionCaller.createCall();
    const sessionPayload = await mockSessionOnce(mockContext.db);
    await knockerCaller.knockCall({ id: callSessionId });
    replayMockSession(sessionPayload);
    await knockerCaller.knockCall({ id: callSessionId });

    expect(callKnockerMap.get(callSessionId)?.size).toBe(1);
  });

  test("the last participant leaving dismisses the pending knockers", async () => {
    expect.hasAssertions();

    const owner = getMockSession();
    const { callSessionId } = await callSessionCaller.createCall();
    const { session: knockerSession } = await mockSessionOnce(mockContext.db);
    await knockerCaller.knockCall({ id: callSessionId });
    setCallParticipant(callSessionId, owner);
    const emitSpy = vi.spyOn(callEventEmitter, "emit");

    deleteCallParticipant(callSessionId, owner.session.id);

    expect(callKnockerMap.has(callSessionId)).toBe(false);
    expect(emitSpy).toHaveBeenCalledExactlyOnceWith("knockerDismissed", {
      callSessionId,
      knockerSessionId: knockerSession.id,
    });
  });

  test("admitKnocker moves the knocker to the admitted map and emits it", async () => {
    expect.hasAssertions();

    const creatorPayload = getMockSession();
    const { callSessionId } = await callSessionCaller.createCall();
    const { session: knockerSession } = await mockSessionOnce(mockContext.db);
    await knockerCaller.knockCall({ id: callSessionId });
    setCallParticipant(callSessionId, creatorPayload);
    const emitSpy = vi.spyOn(callEventEmitter, "emit");
    replayMockSession(creatorPayload);

    await knockerCaller.admitKnocker({ callSessionId, sessionId: knockerSession.id });

    expect(callKnockerMap.get(callSessionId)?.has(knockerSession.id)).toBe(false);
    expect(callAdmittedParticipantMap.get(callSessionId)?.has(knockerSession.id)).toBe(true);
    expect(emitSpy).toHaveBeenCalledExactlyOnceWith("knockerAdmitted", {
      callSessionId,
      knockerSessionId: knockerSession.id,
    });
  });

  test("fails admitKnocker with a caller who is not in the call", async () => {
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

  test("fails admitKnocker with a non-creator participant", async () => {
    expect.hasAssertions();

    const { callSessionId } = await callSessionCaller.createCall();
    const { session: knockerSession } = await mockSessionOnce(mockContext.db);
    await knockerCaller.knockCall({ id: callSessionId });
    const nonCreatorPayload = await mockSessionOnce(mockContext.db);
    setCallParticipant(callSessionId, nonCreatorPayload);

    await expect(
      knockerCaller.admitKnocker({ callSessionId, sessionId: knockerSession.id }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new ForbiddenError("Must be call creator to admit knockers").message}]`,
    );
  });

  test.each(doorkeeperMutations)("fails $action with a non-existent call", async ({ mutate }) => {
    expect.hasAssertions();

    const sessionPayload = await mockSessionOnce(mockContext.db, getMockSession().user);
    setCallParticipant(nonExistentCallSessionId, sessionPayload);

    await expect(
      mutate({ callSessionId: nonExistentCallSessionId, sessionId: crypto.randomUUID() }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new NotFoundError(DatabaseEntityType.CallSession, nonExistentCallSessionId).message}]`,
    );
  });

  test("fails dismissKnocker with a caller who is not in the call", async () => {
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

  test("fails dismissKnocker with a non-creator participant", async () => {
    expect.hasAssertions();

    const { callSessionId } = await callSessionCaller.createCall();
    const { session: knockerSession } = await mockSessionOnce(mockContext.db);
    await knockerCaller.knockCall({ id: callSessionId });
    const nonCreatorPayload = await mockSessionOnce(mockContext.db);
    setCallParticipant(callSessionId, nonCreatorPayload);

    await expect(
      knockerCaller.dismissKnocker({ callSessionId, sessionId: knockerSession.id }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new ForbiddenError("Must be call creator to dismiss knockers").message}]`,
    );
  });

  test("dismissKnocker removes the knocker and emits it", async () => {
    expect.hasAssertions();

    const creatorPayload = getMockSession();
    const { callSessionId } = await callSessionCaller.createCall();
    const { session: knockerSession } = await mockSessionOnce(mockContext.db);
    await knockerCaller.knockCall({ id: callSessionId });
    setCallParticipant(callSessionId, creatorPayload);
    const emitSpy = vi.spyOn(callEventEmitter, "emit");
    replayMockSession(creatorPayload);

    await knockerCaller.dismissKnocker({ callSessionId, sessionId: knockerSession.id });

    expect(callKnockerMap.get(callSessionId)?.has(knockerSession.id)).toBe(false);
    expect(emitSpy).toHaveBeenCalledExactlyOnceWith("knockerDismissed", {
      callSessionId,
      knockerSessionId: knockerSession.id,
    });
  });
});
