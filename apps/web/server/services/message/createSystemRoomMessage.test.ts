import type { useRoomObject } from "#server/composables/realtime/useRoomObject";
import type { RoomObjectRpc } from "@esposter/db-schema";

import { createSystemRoomMessage } from "#server/services/message/createSystemRoomMessage";
import { MessageType } from "@esposter/db-schema";
import { noop } from "@esposter/shared";
import { v7 } from "uuid";
import { describe, expect, test, vi } from "vitest";

// The room's object is faked, so each test reads what the line asked the room to write
const { roomObject } = vi.hoisted(() => ({ roomObject: { createMessage: vi.fn<RoomObjectRpc["createMessage"]>() } }));
vi.mock(import("#server/composables/realtime/useRoomObject"), () => ({
  useRoomObject: () => roomObject as unknown as ReturnType<typeof useRoomObject>,
}));

describe(createSystemRoomMessage, () => {
  const message = "message";
  const roomId = v7();
  const userId = v7();

  // No device is named, so the room echoes the line to every tab of the member, including the one that caused it
  test("posts the line to the room as the member, with no device to leave out", async () => {
    expect.hasAssertions();

    await createSystemRoomMessage(roomId, userId, message).match(noop, (error) => error);

    expect(roomObject.createMessage).toHaveBeenCalledExactlyOnceWith({ message, type: MessageType.System }, { userId });
  });

  test("passes the reply target and the type through for a line that points at another message", async () => {
    expect.hasAssertions();

    const replyToId = 1;
    await createSystemRoomMessage(roomId, userId, message, { replyToId, type: MessageType.PinMessage }).match(
      noop,
      (error) => error,
    );

    expect(roomObject.createMessage).toHaveBeenCalledExactlyOnceWith(
      { message, replyToId, type: MessageType.PinMessage },
      { userId },
    );
  });

  // The line is handed back as a failure rather than logged here, so the caller that knows what it announced owns the
  // Handling
  test("returns a failed write as the result rather than throwing", async () => {
    expect.hasAssertions();

    const error = new Error(" ");
    roomObject.createMessage.mockRejectedValueOnce(error);

    const result = await createSystemRoomMessage(roomId, userId, message).match(noop, (caught) => caught);

    expect(result).toBe(error);
  });
});
