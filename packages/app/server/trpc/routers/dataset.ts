import type { Dataset } from "#shared/models/dataset/Dataset";

import { datasetReferenceSchema } from "#shared/models/dataset/DatasetReference";
import { DatasetProviderMap } from "@@/server/services/dataset/DatasetProviderMap";
import { router } from "@@/server/trpc";
import { standardAuthedProcedure } from "@@/server/trpc/procedure/standardAuthedProcedure";

export const datasetRouter = router({
  readDataset: standardAuthedProcedure
    .input(datasetReferenceSchema)
    .query<Dataset>(({ ctx, input }) => DatasetProviderMap[input.type](ctx, input)),
});
