import type { RequestSizeLimiterOptions } from "#src/models/RequestSizeLimiterOptions";

import { SIZE_LIMITED_METHODS } from "#src/runtime/constants";
import { getRequestSizeLimit } from "#src/runtime/services/getRequestSizeLimit";

// A request is too large when its declared length exceeds the limit for its kind.
// A request with no declared length is not refused here, as there is nothing to compare.
// The middleware counts its body as it is read
export const checkIsRequestTooLarge = (
  method: string,
  contentLength: null | string,
  contentType: null | string,
  options: RequestSizeLimiterOptions,
): boolean => {
  if (!SIZE_LIMITED_METHODS.includes(method) || contentLength === null) return false;

  return Math.trunc(Number(contentLength)) > getRequestSizeLimit(contentType, options);
};
