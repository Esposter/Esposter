const INITIAL_RETRY_MS = Temporal.Duration.from({ seconds: 1 }).total("milliseconds");
const MAX_RETRY_MS = Temporal.Duration.from({ seconds: 30 }).total("milliseconds");

// A socket its caller holds open: a close the caller did not ask for is retried with doubling delays, and the delay
// starts again once a connection opens. The url is read at every connect, so a reconnect carries the room's latest
// Message id. The returned function closes the socket and stops every retry still pending
export const openRealtimeSocket = (getUrl: () => string, onFrame: (text: string) => void) => {
  let socket: WebSocket | undefined;
  let retryMs = INITIAL_RETRY_MS;
  let retryTimer: ReturnType<typeof setTimeout> | undefined;
  let isClosed = false;

  const connect = () => {
    socket = new WebSocket(getUrl());
    socket.addEventListener("open", () => {
      retryMs = INITIAL_RETRY_MS;
    });
    socket.addEventListener("message", (event) => {
      if (typeof event.data === "string") onFrame(event.data);
    });
    socket.addEventListener("close", () => {
      socket = undefined;
      if (isClosed) return;
      retryTimer = setTimeout(connect, retryMs);
      retryMs = Math.min(retryMs * 2, MAX_RETRY_MS);
    });
  };
  connect();

  return () => {
    isClosed = true;
    clearTimeout(retryTimer);
    socket?.close();
  };
};
