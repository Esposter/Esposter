import type { Dataset } from "#shared/models/dataset/Dataset";

import { datasetReferenceSchema } from "#shared/models/dataset/DatasetReference";
import { readDataset } from "@@/server/services/dataset/readDataset";
import { router } from "@@/server/trpc";
import { standardAuthedProcedure } from "@@/server/trpc/procedure/standardAuthedProcedure";

export const datasetRouter = router({
  readDataset: standardAuthedProcedure
    .input(datasetReferenceSchema)
    .query<Dataset>(({ ctx, input }) => readDataset(ctx, input)),
});
