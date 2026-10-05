import type { WebSocketData } from "msw";

// TRPC's client sends text, or bytes under a custom encoder — never a Blob, which only reads asynchronously and
// Would let a later message overtake it
export const toBuffer = (data: WebSocketData): Buffer => {
  if (typeof data === "string") return Buffer.from(data);
  else if (ArrayBuffer.isView(data)) return Buffer.from(data.buffer, data.byteOffset, data.byteLength);
  else if (data instanceof Blob) throw new TypeError("A WebSocket message sent as a Blob cannot be read in order");
  else return Buffer.from(data);
};
