import type { RealtimeSocketOptions } from "@/models/realtime/RealtimeSocketOptions";

import { getExponentialBackoffDelayMs } from "@esposter/shared";

const INITIAL_RETRY_MS = Temporal.Duration.from({ seconds: 1 }).total("milliseconds");
const MAX_RETRY_MS = Temporal.Duration.from({ seconds: 30 }).total("milliseconds");

// A socket its caller holds open: a close the caller did not ask for is retried with doubling delays, and the delay
// Starts again once a connection opens. The url is read at every connect, so a reconnect carries the room's
// Latest message id. `close` closes the socket and stops every retry still pending, and `send` writes a frame up an open
// Socket and drops one while it is closed, which is why `onOpen` runs at every open: what the server must hold is sent
// Again there
export const openRealtimeSocket = (
  getUrl: () => string,
  onFrame: (text: string) => void,
  { onOpen, onReopen, onSettled }: RealtimeSocketOptions = {},
) => {
  let socket: undefined | WebSocket;
  let failureCount = 0;
  let retryTimer: ReturnType<typeof setTimeout> | undefined;
  let isClosed = false;
  let isOpened = false;

  const send = (text: string) => {
    if (socket?.readyState === WebSocket.OPEN) socket.send(text);
  };
  const connect = () => {
    socket = new WebSocket(getUrl());
    socket.addEventListener("open", () => {
      failureCount = 0;
      onSettled?.();
      onOpen?.();
      if (isOpened) onReopen?.();
      isOpened = true;
    });
    socket.addEventListener("message", (event) => {
      if (typeof event.data === "string") onFrame(event.data);
    });
    socket.addEventListener("close", () => {
      socket = undefined;
      onSettled?.();
      if (isClosed) return;
      retryTimer = setTimeout(connect, getExponentialBackoffDelayMs(failureCount, INITIAL_RETRY_MS, MAX_RETRY_MS));
      failureCount += 1;
    });
  };
  connect();

  return {
    close: () => {
      isClosed = true;
      clearTimeout(retryTimer);
      socket?.close();
    },
    send,
  };
};
