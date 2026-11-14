import { queueMessageEnvelopeSchema } from "#src/models/queue/QueueMessageEnvelope";
import { z } from "zod";

// The one message an export request sends. It names the export's row, which the handler builds the archive for. The
// Row's blob name is what the archive is written to
export interface ExportUserDataQueueMessage {
  dataExportId: string;
}

export const exportUserDataQueueMessageSchema = z.object({
  ...queueMessageEnvelopeSchema.shape,
  dataExportId: z.uuidv7(),
}) satisfies z.ZodType<ExportUserDataQueueMessage>;
