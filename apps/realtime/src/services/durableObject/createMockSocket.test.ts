import { RESERVED_CLOSE_CODES } from "#src/services/durableObject/constants";
import { jsonDateParse } from "@esposter/shared";
import { describe, vi } from "vitest";

// A socket the runtime accepted: the close and send calls the object makes are the ones a test reads, and its attachment is
// Held as the runtime holds it across hibernation. A close reports to the state that holds the socket, so the registry drops it
export const createSocket = () => {
  // The largest attachment the runtime keeps, which it measures serialized: 16 KiB in the workerd build the tests run on
  const attachmentMaxBytes = 16_384;
  let attachment: unknown;
  const closeListeners: (() => void)[] = [];
  return {
    close: vi.fn<(code: number, reason: string) => void>((code) => {
      if (RESERVED_CLOSE_CODES.has(code)) throw new TypeError(`Invalid WebSocket close code: ${code}.`);
      for (const listener of closeListeners) listener();
    }),
    deserializeAttachment: () => attachment,
    onClose: (listener: () => void) => {
      closeListeners.push(listener);
    },
    send: vi.fn<(frame: string) => void>(),
    serializeAttachment: (value: unknown) => {
      const size = new TextEncoder().encode(JSON.stringify(value)).byteLength;
      if (size > attachmentMaxBytes)
        throw new TypeError(`A WebSocket 'attachment' cannot be larger than ${attachmentMaxBytes} bytes.`);
      attachment = value;
    },
  };
};

export type MockSocket = ReturnType<typeof createSocket>;

// Each frame a socket was sent, read back as the object wrote it
export const readFrames = (socket: MockSocket) => socket.send.mock.calls.map(([frame]) => jsonDateParse(frame));

// The placeholder a helper-only test file needs, since the suites of the objects it stands in for read its sockets
describe.todo("createSocket");
