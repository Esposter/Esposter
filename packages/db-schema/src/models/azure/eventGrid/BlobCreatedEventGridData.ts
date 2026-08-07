import { z } from "zod";

// The slice of Storage's own `Microsoft.Storage.BlobCreated` payload we read. It is the authoritative source
// For how many bytes actually landed: the client PUTs straight to Azure, so nothing on our side ever sees the
// Body. Storage emits this only for the calls that finalize a blob (`PutBlob`, `PutBlockList`, `CopyBlob`) and
// Never for a staged block, so `contentLength` is always the whole object rather than a fragment of one.
export const blobCreatedEventGridDataSchema = z.object({
  contentLength: z.int().nonnegative(),
});

export type BlobCreatedEventGridData = z.infer<typeof blobCreatedEventGridDataSchema>;
