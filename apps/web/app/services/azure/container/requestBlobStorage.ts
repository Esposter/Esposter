import { InvalidOperationError, Operation } from "@esposter/shared";

// Blob Storage refuses a request with an error status rather than a failed request, so every call the browser
// Makes to it reads the status: unread, an expired SAS or a refused block reports an upload as landed and a read
// As an empty body. The error names the status alone — the url carries the signature
export const requestBlobStorage = async (url: string, init: RequestInit): Promise<Response> => {
  const response = await fetch(url, init);
  if (!response.ok)
    throw new InvalidOperationError(
      init.method === "GET" ? Operation.Read : Operation.Create,
      requestBlobStorage.name,
      `Blob Storage answered ${response.status}`,
    );
  return response;
};
