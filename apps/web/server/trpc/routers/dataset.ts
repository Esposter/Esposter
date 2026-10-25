import type { Dataset } from "#shared/models/dataset/Dataset";

import { readDataset } from "#server/services/dataset/readDataset";
import { router } from "#server/trpc";
import { standardAuthedProcedure } from "#server/trpc/procedure/standardAuthedProcedure";
import { McpScope } from "#shared/models/auth/McpScope";
import { datasetReferenceSchema } from "#shared/models/dataset/DatasetReference";

export const datasetRouter = router({
  readDataset: standardAuthedProcedure
    .input(datasetReferenceSchema)
    .meta({
      mcp: {
        description:
          "Read a dataset as one table: a Sheet's rows, a Survey's responses or a Program's status, named by the resource's id and the provider's type. Answers the columns, the rows and their total.",
        scope: McpScope.Resources,
      },
    })
    .query<Dataset>(({ ctx, input }) => readDataset(ctx, input)),
});
