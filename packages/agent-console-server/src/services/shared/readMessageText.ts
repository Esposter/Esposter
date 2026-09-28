import type { RawData } from "ws";

// A WebSocket message as the text it was sent as, whichever of its three shapes ws delivered it in
export const readMessageText = (data: RawData): string =>
  Buffer.isBuffer(data)
    ? data.toString()
    : Array.isArray(data)
      ? Buffer.concat(data).toString()
      : Buffer.from(data).toString();
