import type { ContentDeltaRequest } from "#src/models/resource/ContentDeltaRequest";
import type { ContentDeltaResponse } from "#src/models/resource/ContentDeltaResponse";

import { compressContentDelta } from "#src/services/resource/compressContentDelta";
import { instantiateZstdEncoder } from "#src/services/resource/instantiateZstdEncoder";
import { getResultAsync, getSynchronizedFunction, takeOne } from "@esposter/shared";

const zstdWasmUrl = takeOne(
  Object.values(
    import.meta.glob<string>("#src/generated/zstd/zstd.wasm", { eager: true, import: "default", query: "?url" }),
  ),
);

// Compresses a document against its baseline off the main thread: a dictionary as large as the document makes it
// Seconds of work at the content limit. One worker per save, terminated after it, so the encoder's memory — the
// Size of both documents and then some — is handed back rather than held by a tab that saved once
// The worker ignores what its listener returns, and the listener posts its own failure back
self.addEventListener(
  "message",
  getSynchronizedFunction(async (event: MessageEvent<ContentDeltaRequest>) => {
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
        // oxlint-disable-next-line unicorn/require-post-message-target-origin -- a Worker's postMessage takes no origin
        self.postMessage(response);
      },
    );
  }),
);
