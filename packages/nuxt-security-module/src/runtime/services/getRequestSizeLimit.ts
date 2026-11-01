import type { RequestSizeLimiterOptions } from "#src/models/RequestSizeLimiterOptions";

import { FILE_UPLOAD_CONTENT_TYPE } from "#src/runtime/constants";

// The byte limit a request's body is held to. A file upload has its own, larger limit.
export const getRequestSizeLimit = (
  contentType: null | string,
  { maxRequestSizeInBytes, maxUploadFileRequestInBytes }: RequestSizeLimiterOptions,
): number => {
  const isFileUpload = contentType?.includes(FILE_UPLOAD_CONTENT_TYPE) ?? false;
  return isFileUpload ? maxUploadFileRequestInBytes : maxRequestSizeInBytes;
};
