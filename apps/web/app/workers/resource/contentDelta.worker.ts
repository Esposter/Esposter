import type { ContentDeltaRequest } from "@/models/resource/ContentDeltaRequest";
import type { ContentDeltaResponse } from "@/models/resource/ContentDeltaResponse";

import zstdWasmUrl from "@/generated/zstd/zstd.wasm?url";
import { compressContentDelta } from "@/services/resource/compressContentDelta";
import { instantiateZstdEncoder } from "@/services/resource/instantiateZstdEncoder";
import { getResultAsync } from "@esposter/shared";

// Compresses a document against its baseline off the main thread: a dictionary as large as the document makes it
// Seconds of work at the content limit. One worker per save, terminated after it, so the encoder's memory — the
// Size of both documents and then some — is handed back rather than held by a tab that saved once
self.addEventListener("message", async (event: MessageEvent<ContentDeltaRequest>) => {
  const { baseline, content } = event.data;
  await getResultAsync(async () => {
    const wasm = await (await fetch(zstdWasmUrl)).arrayBuffer();
    const zstdEncoder = await instantiateZstdEncoder(wasm);
    return compressContentDelta(zstdEncoder, content, baseline);
  }).match(
    (delta) => {
      const response: ContentDeltaResponse = { delta };
      self.postMessage(response, { transfer: [delta.buffer] });
    },
    ({ message }) => {
      const response: ContentDeltaResponse = { errorMessage: message };
      self.postMessage(response);
    },
  );
});
