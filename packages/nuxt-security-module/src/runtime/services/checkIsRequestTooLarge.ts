import type { RequestSizeLimiterOptions } from "#src/models/RequestSizeLimiterOptions";

import { FILE_UPLOAD_CONTENT_TYPE, SIZE_LIMITED_METHODS } from "#src/runtime/constants";

// A request is too large when its declared length reaches the limit for its kind.
// A file upload has its own, larger limit.
// A request with no declared length is not refused here, as there is nothing to compare
export const checkIsRequestTooLarge = (
  method: string,
  contentLength: null | string,
  contentType: null | string,
  { maxRequestSizeInBytes, maxUploadFileRequestInBytes }: RequestSizeLimiterOptions,
): boolean => {
  if (!SIZE_LIMITED_METHODS.includes(method) || contentLength === null) return false;

  const isFileUpload = contentType?.includes(FILE_UPLOAD_CONTENT_TYPE) ?? false;
  const limit = isFileUpload ? maxUploadFileRequestInBytes : maxRequestSizeInBytes;
  return Math.trunc(Number(contentLength)) >= limit;
};
