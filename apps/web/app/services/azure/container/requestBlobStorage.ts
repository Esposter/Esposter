import { InvalidOperationError, Operation } from "@esposter/shared";

// Blob Storage refuses a write with an error status rather than a failed request, so every call the upload makes
// Reads the status: unread, an expired SAS or a refused block reports the upload as landed. The error names the
// Status alone — the url carries the signature
export const requestBlobStorage = async (url: string, init: RequestInit): Promise<Response> => {
  const response = await fetch(url, init);
  if (!response.ok)
    throw new InvalidOperationError(
      Operation.Create,
      requestBlobStorage.name,
      `Blob Storage answered ${response.status}`,
    );
  return response;
};
