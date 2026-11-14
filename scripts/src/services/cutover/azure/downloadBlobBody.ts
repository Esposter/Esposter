import type { ContainerClient } from "@azure/storage-blob";

import { getResultAsync, InvalidOperationError, Operation } from "@esposter/shared";

// The streamed body of a blob. A failed download throws naming the blob, since copies run side by side.
// The error alone would not say which one it was
export const downloadBlobBody = async (
  containerClient: ContainerClient,
  name: string,
): Promise<NodeJS.ReadableStream> => {
  const { readableStreamBody } = await getResultAsync(() => containerClient.getBlobClient(name).download()).match(
    (response) => response,
    (error) => {
      throw new InvalidOperationError(Operation.Read, name, `could not be downloaded: ${error.message}`);
    },
  );
  if (!readableStreamBody) throw new InvalidOperationError(Operation.Read, name, "returned no body");
  return readableStreamBody;
};
