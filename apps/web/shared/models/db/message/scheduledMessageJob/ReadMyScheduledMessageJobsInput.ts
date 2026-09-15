import { createOffsetPaginationParamsSchema } from "#shared/models/pagination/offset/OffsetPaginationParams";
import { SortOrder } from "#shared/models/pagination/sorting/SortOrder";
import { selectScheduledMessageJobInMessageSchema } from "@esposter/db-schema";
import type { z } from "zod";

export const readMyScheduledMessageJobsInputSchema = createOffsetPaginationParamsSchema(
  selectScheduledMessageJobInMessageSchema.keyof(),
  [{ key: "runAt", order: SortOrder.Asc }],
)
  .omit({ sortBy: true })
  .prefault({});
export type ReadMyScheduledMessageJobsInput = z.infer<typeof readMyScheduledMessageJobsInputSchema>;
