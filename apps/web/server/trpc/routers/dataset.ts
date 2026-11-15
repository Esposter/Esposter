import type { Dataset } from "#shared/models/dataset/Dataset";

import { readDataset } from "#server/services/dataset/readDataset";
import { getResourceTopics } from "#server/services/resource/getResourceTopics";
import { router } from "#server/trpc/index";
import { getTopicsProcedure } from "#server/trpc/procedure/getTopicsProcedure";
import { standardAuthedProcedure } from "#server/trpc/procedure/standardAuthedProcedure";
import { datasetReferenceSchema } from "#shared/models/dataset/DatasetReference";
import { McpScope } from "@esposter/db-schema";

export const datasetRouter = router({
  readDataset: getTopicsProcedure(
    standardAuthedProcedure
      .input(datasetReferenceSchema)
      .meta({
        mcp: {
          description:
            "Read a dataset as one table: a Sheet's rows, a Survey's responses or a Program's status, named by the resource's id and the provider's type. Answers the columns, the rows and their total.",
          scope: McpScope.Resources,
        },
      }),
    getResourceTopics,
  ).query<Dataset>(({ ctx, input }) => readDataset(ctx, input)),
});
