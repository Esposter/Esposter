import type { AuthedContext } from "#server/models/auth/AuthedContext";
import type { Dataset } from "#shared/models/dataset/Dataset";
import type { DatasetReference } from "#shared/models/dataset/DatasetReference";

import { readDataset } from "#server/services/dataset/readDataset";
import { getDanglingProgramBindingError } from "#server/services/program/getDanglingProgramBindingError";
import { getResultAsync } from "@esposter/shared";
import { TRPCError } from "@trpc/server";

// An audience whose source is gone reads as NOT_FOUND, surfaced as the program's own dangling-binding error, whose
// Fix is the same rebind. Every other failure is a real fault and propagates, so a transient storage or parse error
// Is never mistaken for a permanently broken binding
export const readProgramAudienceDataset = (ctx: AuthedContext, audience: DatasetReference): Promise<Dataset> =>
  getResultAsync(() => readDataset(ctx, audience)).match(
    (dataset) => dataset,
    (error) => {
      if (error instanceof TRPCError && error.code === "NOT_FOUND") throw getDanglingProgramBindingError();
      throw error;
    },
  );
