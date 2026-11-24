import type { ObjectCall } from "#src/workers/models/ObjectCall";
import type { ObjectReply } from "#src/workers/models/ObjectReply";

import { createObjectStub } from "#src/workers/services/createObjectStub";
import { describe, expect, test } from "vitest";

describe(createObjectStub, () => {
  // A stub answers no `then`, so it is not a thenable and an await does not wait on it.
  // An RPC called on it is recorded.
  test("answers no then, and records only the RPCs called on it", async () => {
    expect.hasAssertions();

    const objectCalls: ObjectCall[] = [];
    const objectReplies = new Map<string, ObjectReply>([["ping", () => "pong"]]);
    const stub = createObjectStub<{ ping: () => string }>("object", objectCalls, objectReplies);

    expect(Reflect.get(stub, "then")).toBeUndefined();
    await expect(stub.ping()).resolves.toBe("pong");
    expect(objectCalls).toStrictEqual([{ args: [], method: "ping", objectId: "object" }]);
  });
});
