import type { Resource } from "@esposter/db-schema";

// Where a save too large for one request body is uploaded before its commit, beside the content blob it becomes.
// One fixed name per resource rather than one per upload: an abandoned upload is overwritten by the next large
// Save and taken by purge with the rest of the directory, so nothing has to sweep for orphans
export const getStagingContentBlobName = (resourceId: Resource["id"]) => `${resourceId}/stagedContent.json.gz`;
