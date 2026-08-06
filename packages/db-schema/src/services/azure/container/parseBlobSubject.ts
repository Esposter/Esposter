import type { AzureContainer } from "@/models/azure/container/AzureContainer";

import { getBlobSubjectPrefix } from "@/services/azure/container/getBlobSubjectPrefix";

// The inverse of getBlobSubjectPrefix for a known set of containers: a storage event's subject back into the
// (container, blob name) pair the ledger is keyed by. Returns undefined for anything outside the given set,
// So a subscription filter that drifts wider than its handler expects is a no-op rather than a mis-attribution.
export const parseBlobSubject = (subject: string, containerNames: AzureContainer[]) => {
  for (const containerName of containerNames) {
    const prefix = getBlobSubjectPrefix(containerName);
    if (subject.startsWith(prefix)) return { blobName: subject.slice(prefix.length), containerName };
  }

  return undefined;
};
