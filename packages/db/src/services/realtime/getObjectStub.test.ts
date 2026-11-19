import type { ObjectInvoker } from "#src/models/realtime/ObjectInvoker";

import { getObjectStub } from "#src/services/realtime/getObjectStub";
import { describe, expect, test, vi } from "vitest";

// An object's stub as its class types it: one RPC method, and the invoke every object answers its methods through
type RoomStub = ObjectInvoker & { readMessages: (ids: number[]) => Promise<string> };

describe(getObjectStub, () => {
  test("names the object by the id its namespace gives the name", () => {
    expect.hasAssertions();

    const roomStub: RoomStub = {
      invoke: () => Promise.resolve({ readSet: [], result: "", writeSet: [] }),
      readMessages: () => Promise.resolve(""),
    };
    const get = vi.fn<(id: string) => RoomStub>(() => roomStub);

    getObjectStub({ get, idFromName: (name) => `id:${name}` }, "room");

    expect(get).toHaveBeenCalledExactlyOnceWith("id:room");
  });
});
