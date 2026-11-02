import type { RequestSizeLimiterOptions } from "#src/models/RequestSizeLimiterOptions";

import { SIZE_LIMITED_METHODS } from "#src/runtime/constants";

// A request is too large when its declared length exceeds the limit its route sets.
// A request with no declared length is not refused here, as there is nothing to compare.
// The middleware counts its body as it is read
export const checkIsRequestTooLarge = (
  method: string,
  contentLength: null | string,
  { maxRequestSizeInBytes }: RequestSizeLimiterOptions,
): boolean => {
  if (!SIZE_LIMITED_METHODS.includes(method) || contentLength === null) return false;

  return Math.trunc(Number(contentLength)) > maxRequestSizeInBytes;
};
