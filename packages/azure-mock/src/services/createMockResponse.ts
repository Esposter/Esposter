import type { MockResponse } from "#src/models/MockResponse";

import { toWebResourceLike } from "#src/services/container/toWebResourceLike";
import { toHttpHeadersLike } from "@azure/core-http-compat";
import { createHttpHeaders, createPipelineRequest } from "@azure/core-rest-pipeline";

export const createMockResponse = (status: number, url = ""): MockResponse => ({
  headers: toHttpHeadersLike(createHttpHeaders()),
  parsedHeaders: {},
  request: toWebResourceLike(createPipelineRequest({ url })),
  status,
});
