import type { Dataset } from "#shared/models/dataset/Dataset";

import { readDataset } from "#server/services/dataset/readDataset";
import { router } from "#server/trpc";
import { standardAuthedProcedure } from "#server/trpc/procedure/standardAuthedProcedure";
import { datasetReferenceSchema } from "#shared/models/dataset/DatasetReference";

export const datasetRouter = router({
  readDataset: standardAuthedProcedure
    .input(datasetReferenceSchema)
    .query<Dataset>(({ ctx, input }) => readDataset(ctx, input)),
});
