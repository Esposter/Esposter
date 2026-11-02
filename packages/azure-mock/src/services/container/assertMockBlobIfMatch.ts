import { MockRestError } from "#src/models/shared/MockRestError";
import { CONDITION_NOT_MET_MESSAGE } from "#src/services/constants";
import { getMockContainer } from "#src/services/container/getMockContainer";
import { readMockBlobDates } from "#src/services/container/readMockBlobDates";

// The `ifMatch` claim, shared by a conditional write and a conditional delete: the call lands only if the blob still
// Carries the etag the caller read. Whoever writes first re-mints it, so every other holder of the old value is refused
// — which is how concurrent workers agree on one owner without a lock. A blob that is not there carries no etag at all,
// So the claim is refused rather than falling back to the seeded value a reader would have been given: a worker holding
// The etag of a blob somebody has since deleted would otherwise win the race against its own absence
export const assertMockBlobIfMatch = (containerName: string, blobName: string, ifMatch: string | undefined): void => {
  if (ifMatch === undefined) return;
  const etag = getMockContainer(containerName).has(blobName)
    ? readMockBlobDates(containerName, blobName).etag
    : undefined;
  if (ifMatch !== etag) throw new MockRestError(CONDITION_NOT_MET_MESSAGE, 412);
};
