import type { Dashboard } from "#shared/models/dashboard/data/Dashboard";
import type { AuthedContext } from "@@/server/models/auth/AuthedContext";
import type { ToData } from "@esposter/shared";

import { DatasetProviderMap } from "@@/server/services/dataset/DatasetProviderMap";
import { getResultAsync, NotFoundError } from "@esposter/shared";
import { TRPCError } from "@trpc/server";

// Bakes each bound visual's resolved dataset into the published content
// So public viewers render a static snapshot without resolving references
export const transformPublishedDashboard = async (
  ctx: AuthedContext,
  dashboard: ToData<Dashboard>,
): Promise<ToData<Dashboard>> => ({
  ...dashboard,
  visuals: await Promise.all(
    dashboard.visuals.map(async (visual) => {
      if (!visual.dataset) return visual;
      const { dataset } = visual;
      // A stale reference (e.g. deleted survey/table document) fails publish with a clear message
      // instead of an opaque provider error
      const snapshot = await getResultAsync(() =>
        DatasetProviderMap[dataset.reference.type](ctx, dataset.reference),
      ).match(
        (newSnapshot) => newSnapshot,
        () => {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: new NotFoundError("Dataset", dataset.reference.id).message,
          });
        },
      );
      return { ...visual, dataset: { ...dataset, snapshot } };
    }),
  ),
});
