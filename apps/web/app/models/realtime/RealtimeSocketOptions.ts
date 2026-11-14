export interface RealtimeSocketOptions {
  // Runs at every open, the first and each reconnect, for what the server must be told again on a new connection
  onOpen?: () => void;
  // Runs when a connection opens after one that did, for what the socket could not carry while it was closed
  onReopen?: () => void;
  // Runs each time an attempt opens or closes, so a caller waiting on the socket's first attempt is released either way
  onSettled?: () => void;
}
