import type { ObjectInvoker } from "#src/models/realtime/ObjectInvoker";
import type { ColumnTopic } from "@esposter/db-schema";

import { createObjectStub } from "#src/services/realtime/createObjectStub";
import { describe, expect, test, vi } from "vitest";

// A stub as a Durable Object's own class types it: one RPC method, the HTTP entry a socket is forwarded to, and the
// Invoke every object answers its RPC methods through. Its readThreads is a decoy, since a call through the wrapper
// Must not reach it
const createRoomStub = () => {
  const readThreads = vi.fn<(threadRootIds: number[]) => Promise<string[]>>((threadRootIds) =>
    Promise.resolve(threadRootIds.map(String)),
  );
  const fetch = vi.fn<(url: string) => Promise<Response>>((url) => Promise.resolve(new Response(url)));
  const invoke = vi.fn<ObjectInvoker["invoke"]>((method, args) =>
    Promise.resolve({ readSet: [{ topic: "messages:*" }], result: `${method}:${JSON.stringify(args)}`, writeSet: [] }),
  );
  return { fetch, invoke, readThreads };
};

describe(createObjectStub, () => {
  test("answers an RPC method with the result its object's invoke gives, by the method's name and arguments", async () => {
    expect.hasAssertions();

    const stub = createRoomStub();
    const roomObject = createObjectStub(stub);

    await expect(roomObject.readThreads([7])).resolves.toBe("readThreads:[[7]]");
    expect(stub.invoke).toHaveBeenCalledExactlyOnceWith("readThreads", [[7]]);
    expect(stub.readThreads).not.toHaveBeenCalled();
  });

  test("hands the read set its call reports to the callback it is given", async () => {
    expect.hasAssertions();

    const reads: ColumnTopic[][] = [];
    const roomObject = createObjectStub(createRoomStub(), (readSet) => {
      reads.push(readSet);
    });

    await roomObject.readThreads([7]);

    expect(reads).toStrictEqual([[{ topic: "messages:*" }]]);
  });

  test("forwards the object's HTTP entry to the object itself, not through invoke", async () => {
    expect.hasAssertions();

    const stub = createRoomStub();
    const roomObject = createObjectStub(stub);

    const response = await roomObject.fetch("https://example.test/ws");

    await expect(response.text()).resolves.toBe("https://example.test/ws");
    expect(stub.invoke).not.toHaveBeenCalled();
  });
});
