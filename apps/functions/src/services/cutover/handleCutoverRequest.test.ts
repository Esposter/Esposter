import type { RoomObjectRpc } from "@esposter/db-schema";

import { CUTOVER_SECRET_HEADER, ROOM_IMPORT_PATH } from "#src/services/cutover/constants";
import { handleCutoverRequest } from "#src/services/cutover/handleCutoverRequest";
import { v7 } from "uuid";
import { describe, expect, test, vi } from "vitest";

describe(handleCutoverRequest, () => {
  const secret = v7();
  const roomId = v7();
  const emptyCopy = { messages: [], reactions: [], scheduledMessages: [] };
  const summary = { messageCount: 0, newestId: null };

  // The room's object as the route reaches it, with its import recorded
  const createEnvironment = () => {
    const importRoom = vi.fn<RoomObjectRpc["importRoom"]>(() => Promise.resolve(summary));
    const idFromName = vi.fn((name: string) => name);
    const get = vi.fn(() => ({ importRoom }));
    const environment = { CUTOVER_SECRET: secret, ROOM: { get, idFromName } };
    return { environment: environment as unknown as Cloudflare.Env, importRoom, idFromName };
  };

  const createImportRequest = (body: string, requestSecret = secret) =>
    new Request(`https://example.com${ROOM_IMPORT_PATH}`, {
      body,
      headers: { [CUTOVER_SECRET_HEADER]: requestSecret },
      method: "POST",
    });

  test("a room import is sent to the object of the room it names, without the name, and answers its summary", async () => {
    expect.hasAssertions();

    const { environment, idFromName, importRoom } = createEnvironment();
    const response = await handleCutoverRequest(
      createImportRequest(JSON.stringify({ roomId, ...emptyCopy })),
      environment,
    );

    expect(idFromName).toHaveBeenCalledExactlyOnceWith(roomId);
    expect(importRoom).toHaveBeenCalledExactlyOnceWith(emptyCopy);
    expect(await response.json()).toStrictEqual(summary);
  });

  test("a room import with the wrong secret is refused before any room object is reached", async () => {
    expect.hasAssertions();

    const { environment, importRoom } = createEnvironment();
    const response = await handleCutoverRequest(
      createImportRequest(JSON.stringify({ roomId, ...emptyCopy }), v7()),
      environment,
    );

    expect(response.status).toBe(401);
    expect(importRoom).not.toHaveBeenCalled();
  });

  test("a room import whose body is not the copy's shape is a 400, and no room object is reached", async () => {
    expect.hasAssertions();

    const { environment, importRoom } = createEnvironment();
    const response = await handleCutoverRequest(createImportRequest(JSON.stringify({ roomId })), environment);

    expect(response.status).toBe(400);
    expect(importRoom).not.toHaveBeenCalled();
  });
});
