import type { WebResourceLike } from "@azure/core-http-compat";
import type { PipelineRequest } from "@azure/core-rest-pipeline";

import { toHttpHeadersLike } from "@azure/core-http-compat";

export const toWebResourceLike = (request: PipelineRequest): WebResourceLike => ({
  abortSignal: request.abortSignal,
  agent: request.agent,
  body: request.body,
  clone: (): WebResourceLike => {
    throw new Error("Cannot clone a non-proxied WebResourceLike");
  },
  formData: request.formData,
  headers: toHttpHeadersLike(request.headers),
  keepAlive: request.disableKeepAlive,
  method: request.method,
  onDownloadProgress: request.onDownloadProgress,
  onUploadProgress: request.onUploadProgress,
  prepare: (): WebResourceLike => {
    throw new Error("WebResourceLike.prepare() is not supported by @azure/core-http-compat");
  },
  proxySettings: request.proxySettings,
  requestId: request.headers.get("x-ms-client-request-id") ?? request.requestId,
  requestOverrides: request.requestOverrides,
  streamResponseStatusCodes: request.streamResponseStatusCodes,
  timeout: request.timeout,
  url: request.url,
  validateRequestProperties: () => {},
  withCredentials: request.withCredentials,
});
