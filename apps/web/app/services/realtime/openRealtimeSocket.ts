const INITIAL_RETRY_MS = Temporal.Duration.from({ seconds: 1 }).total("milliseconds");
const MAX_RETRY_MS = Temporal.Duration.from({ seconds: 30 }).total("milliseconds");

// A socket its caller holds open: a close the caller did not ask for is retried with doubling delays, and the delay
// starts again once a connection opens. The url is read at every connect, so a reconnect carries the room's latest
// Message id. The returned function closes the socket and stops every retry still pending. `onSettled` runs each time
// an attempt opens or closes, so a caller waiting on the socket's first attempt is released whichever way it goes.
// `onReopen` runs when a connection opens after one that did, for what the socket could not carry while it was closed
export const openRealtimeSocket = (
  getUrl: () => string,
  onFrame: (text: string) => void,
  onSettled?: () => void,
  onReopen?: () => void,
) => {
  let socket: WebSocket | undefined;
  let retryMs = INITIAL_RETRY_MS;
  let retryTimer: ReturnType<typeof setTimeout> | undefined;
  let isClosed = false;
  let isOpened = false;

  const connect = () => {
    socket = new WebSocket(getUrl());
    socket.addEventListener("open", () => {
      retryMs = INITIAL_RETRY_MS;
      onSettled?.();
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
