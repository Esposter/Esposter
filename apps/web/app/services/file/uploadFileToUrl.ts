import type { UploadFileToUrlOptions } from "@/models/file/UploadFileToUrlOptions";

import { StorageStatusError } from "@/models/file/StorageStatusError";
import { Operation } from "@esposter/shared";

// One PUT of the whole file to the url the server presigned for it. The signature covers the Content-Type, so the request
// sends the file's own type, and a status outside 2xx means the object was not stored. Progress is the share of bytes the
// browser has sent, which only XMLHttpRequest reports; fetch does not
export const uploadFileToUrl = (file: Blob, url: string, { isCreateOnly, onProgress }: UploadFileToUrlOptions = {}) =>
  new Promise<void>((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open("PUT", url);
    request.setRequestHeader("Content-Type", file.type);
    if (isCreateOnly) request.setRequestHeader("If-None-Match", "*");
    request.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) onProgress?.(event.loaded / event.total);
    });
    request.addEventListener("load", () => {
      if (request.status >= 200 && request.status < 300) {
        // An empty file has no bytes to count, so its completion is the one progress it reports
        onProgress?.(1);
        resolve();
      } else reject(new StorageStatusError(Operation.Create, uploadFileToUrl.name, request.status));
    });
    request.addEventListener("error", () => {
      reject(new StorageStatusError(Operation.Create, uploadFileToUrl.name, request.status));
    });
    request.send(file);
  });
