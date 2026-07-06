import type { Dashboard } from "#shared/models/dashboard/data/Dashboard";
import type { AuthedContext } from "@@/server/models/auth/AuthedContext";
import type { ToData } from "@esposter/shared";

import { DatasetProviderMap } from "@@/server/services/dataset/DatasetProviderMap";
// Bakes each bound visual's resolved dataset into the published content
// So public viewers render a static snapshot without resolving references
export const transformPublishedDashboard = async (
  ctx: AuthedContext,
  dashboard: ToData<Dashboard>,
): Promise<ToData<Dashboard>> => ({
  ...dashboard,
  visuals: await Promise.all(
    dashboard.visuals.map(async (visual) =>
      visual.dataset
        ? {
            ...visual,
            dataset: {
              ...visual.dataset,
              snapshot: await DatasetProviderMap[visual.dataset.reference.type](ctx, visual.dataset.reference),
            },
          }
        : visual,
    ),
  ),
});
