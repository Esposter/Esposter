import type { WebResourceLike } from "@azure/core-http-compat";
import type { PipelineRequest } from "@azure/core-rest-pipeline";

import { NotImplementedError } from "#src/models/shared/NotImplementedError";
import { toHttpHeadersLike } from "@azure/core-http-compat";
import { noop } from "@esposter/shared";

export const toWebResourceLike = (request: PipelineRequest): WebResourceLike => ({
  abortSignal: request.abortSignal,
  agent: request.agent,
  body: request.body,
  clone: (): WebResourceLike => {
    throw new NotImplementedError(`${toWebResourceLike.name}(…).clone`);
  },
  formData: request.formData,
  headers: toHttpHeadersLike(request.headers),
  keepAlive: request.disableKeepAlive,
  method: request.method,
  onDownloadProgress: request.onDownloadProgress,
  onUploadProgress: request.onUploadProgress,
  prepare: (): WebResourceLike => {
    throw new NotImplementedError(`${toWebResourceLike.name}(…).prepare`);
  },
  proxySettings: request.proxySettings,
  requestId: request.headers.get("x-ms-client-request-id") ?? request.requestId,
  requestOverrides: request.requestOverrides,
  streamResponseStatusCodes: request.streamResponseStatusCodes,
  timeout: request.timeout,
  url: request.url,
  validateRequestProperties: noop,
  withCredentials: request.withCredentials,
});
