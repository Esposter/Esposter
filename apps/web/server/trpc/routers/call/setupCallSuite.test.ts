import type { Context } from "@@/server/trpc/context";
import type { TRPCRouter } from "@@/server/trpc/routers";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { callAdmittedParticipantMap } from "@@/server/services/message/call/callAdmittedParticipantMap";
import { callKnockerMap } from "@@/server/services/message/call/callKnockerMap";
import { callSessionParticipantMap } from "@@/server/services/message/call/callSessionParticipantMap";
import { createCallerFactory } from "@@/server/trpc";
import { createMockContext } from "@@/server/trpc/context.test";
import { callRouter } from "@@/server/trpc/routers/call";
import { callSessionsInMessage, roomsInMessage } from "@esposter/db-schema";
import { afterEach, beforeAll, describe, vi } from "vitest";

// Call-suite fixture: owns the mock context, the call caller (whose `knocker` is the knocker router), and the
// Cleanup every call suite owes — the three in-memory call maps, the session and room rows, and the spies.
// Suite-specific hooks compose — before-hooks run after these, after-hooks before.
export const setupCallSuite = () => {
  let mockContext: Context;
  let callCaller: DecorateRouterRecord<TRPCRouter["callSession"]>;

  beforeAll(async () => {
    mockContext = await createMockContext();
    callCaller = createCallerFactory(callRouter)(mockContext);
  });

  afterEach(async () => {
    callAdmittedParticipantMap.clear();
    callKnockerMap.clear();
    callSessionParticipantMap.clear();
    await mockContext.db.delete(callSessionsInMessage);
    await mockContext.db.delete(roomsInMessage);
    vi.restoreAllMocks();
  });

  return { getCallCaller: () => callCaller, getMockContext: () => mockContext };
};

describe.todo("setupCallSuite");
