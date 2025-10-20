import type { HttpRequestBody } from "@azure/storage-blob";

import { isReadableStream } from "@/services/container/isReadableStream";
import { exhaustiveGuard, streamToText } from "@esposter/shared";

export const bodyToBuffer = async (body: HttpRequestBody): Promise<Buffer> => {
  if (body === null) return Buffer.alloc(0);
  else if (typeof body === "string") return Buffer.from(body);
  else if (body instanceof ArrayBuffer) return Buffer.from(body);
  else if (ArrayBuffer.isView(body)) return Buffer.from(body.buffer, body.byteOffset, body.byteLength);
  // A function that returns a stream or blob
  else if (typeof body === "function") {
    const streamOrBlob = body();
    return bodyToBuffer(streamOrBlob);
  }
  // Blob type (must be checked before stream-like objects)
  else if (body instanceof Blob) {
    const arrayBuffer = await body.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }
  // NodeJS.ReadableStream
  else if (isReadableStream(body)) return Buffer.from(await streamToText(body));
  // Web API ReadableStream
  else if (body instanceof ReadableStream) {
    const reader = body.getReader();
    const chunks: Uint8Array[] = [];
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      else chunks.push(value);
    }
    return Buffer.concat(chunks);
  }
  // FormData is not supported as its serialization is complex
  else if (body instanceof FormData) throw new Error("FormData is not supported in this mock implementation.");
  else exhaustiveGuard(body);
};
