import type { ContentDeltaRequest } from "@/models/resource/ContentDeltaRequest";
import type { ContentDeltaResponse } from "@/models/resource/ContentDeltaResponse";

import ContentDeltaWorker from "@/workers/resource/contentDelta.worker?worker";
import { InvalidOperationError, Operation, withFinalizerAsync } from "@esposter/shared";

// Hands one document and its baseline to a worker of its own and takes the delta back. Loaded behind the delta
// Path's own import, so the worker and its wasm are fetched only by a tab that saves a large document
export const encodeContentDelta = (content: Uint8Array, baseline: Uint8Array): Promise<Uint8Array<ArrayBuffer>> => {
  const worker = new ContentDeltaWorker();
  const { promise, reject, resolve } = Promise.withResolvers<Uint8Array<ArrayBuffer>>();
  worker.addEventListener("message", (event: MessageEvent<ContentDeltaResponse>) => {
    if ("delta" in event.data) resolve(event.data.delta);
    else reject(new InvalidOperationError(Operation.Create, encodeContentDelta.name, event.data.errorMessage));
  });
  worker.addEventListener("error", (event) => {
    reject(new InvalidOperationError(Operation.Create, encodeContentDelta.name, event.message));
  });
  const request: ContentDeltaRequest = { baseline, content };
  // oxlint-disable-next-line unicorn/require-post-message-target-origin -- a Worker's postMessage takes no origin
  worker.postMessage(request);
  return withFinalizerAsync(
    () => promise,
    () => {
      worker.terminate();
    },
  );
};
