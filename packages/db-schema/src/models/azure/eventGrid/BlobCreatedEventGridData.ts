import { z } from "zod";

// The slice of Storage's own `Microsoft.Storage.BlobCreated` payload we read. It is the authoritative source
// For how many bytes actually landed: the client PUTs straight to Azure, so nothing on our side ever sees the
// Body. Storage emits this only for the calls that finalize a blob (`PutBlob`, `PutBlockList`, `CopyBlob`) and
// Never for a staged block, so `contentLength` is always the whole object rather than a fragment of one.
//
// `sequencer` is how two events for the same blob are ordered against each other. Event Grid delivers
// At-least-once and in no particular order, so the later write's event can arrive first; the sequencer is the
// Only thing in the payload that says which write actually happened last. Storage documents it as a hex string
// That is compared lexicographically once padded to a common length — never as a number, since it overflows one.
export interface BlobCreatedEventGridData {
  contentLength: number;
  sequencer: string;
}

export const blobCreatedEventGridDataSchema = z.object({
  contentLength: z.int().nonnegative(),
  sequencer: z.string(),
}) satisfies z.ZodType<BlobCreatedEventGridData>;
