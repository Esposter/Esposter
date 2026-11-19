import type { ObjectInvoker } from "#src/models/realtime/ObjectInvoker";

import { getObjectStub } from "#src/services/realtime/getObjectStub";
import { describe, expect, test, vi } from "vitest";

// An object's stub as its class types it: one RPC method, and the invoke every object answers its methods through
type RoomStub = ObjectInvoker & { readMessages: (ids: number[]) => Promise<string> };

describe(getObjectStub, () => {
  test("reaches the object its name resolves to, and runs its RPC method through that object's invoke", async () => {
    expect.hasAssertions();

    const invoke = vi.fn<ObjectInvoker["invoke"]>(() =>
      Promise.resolve({ readSet: [{ topic: "messages:*" }], result: "a", writeSet: [] }),
    );
    const roomStub: RoomStub = { invoke, readMessages: () => Promise.resolve("decoy") };
    const get = vi.fn<(id: string) => RoomStub>(() => roomStub);
    const reads: unknown[] = [];

    const room = getObjectStub({ get, idFromName: (name) => `id:${name}` }, "room", (readSet) => {
      reads.push(readSet);
    });

    await expect(room.readMessages([1])).resolves.toBe("a");
    expect(get).toHaveBeenCalledExactlyOnceWith("id:room");
    expect(invoke).toHaveBeenCalledExactlyOnceWith("readMessages", [[1]]);
    expect(reads).toStrictEqual([[{ topic: "messages:*" }]]);
  });
});
