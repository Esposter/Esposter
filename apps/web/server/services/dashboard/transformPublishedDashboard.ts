import type { PublishableResourceProcedureOptions } from "#server/models/resource/PublishableResourceProcedureOptions";
import type { Dashboard } from "#shared/models/dashboard/data/Dashboard";
import type { ToData } from "@esposter/shared";

import { projectDatasetToQuery } from "#server/services/dashboard/projectDatasetToQuery";
import { readDataset } from "#server/services/dataset/readDataset";
import { getNotFoundError } from "#server/trpc/guards/getNotFoundError";
import { getResultAsync } from "@esposter/shared";

// Bakes each bound visual's resolved dataset into the published content, a group's visuals included, so public viewers
// Render a static snapshot without resolving references
export const transformPublishedDashboard: NonNullable<
  PublishableResourceProcedureOptions<ToData<Dashboard>>["transformPublishedContent"]
> = async (ctx, _resource, dashboard) => {
  const bakeVisuals = (visuals: ToData<Dashboard>["visuals"]): Promise<ToData<Dashboard>["visuals"]> =>
    Promise.all(
      visuals.map(async (visual) => {
        const bakedVisual = visual.visuals ? { ...visual, visuals: await bakeVisuals(visual.visuals) } : visual;
        if (!bakedVisual.dataset) return bakedVisual;
        const { dataset } = bakedVisual;
        // A stale reference (e.g. deleted survey/table document) fails publish with a clear message
        // Instead of an opaque provider error
        const snapshot = await getResultAsync(() => readDataset(ctx, dataset.reference)).match(
          (newSnapshot) => newSnapshot,
          (error) => {
            // The provider's own reason is what says which of the two it was — a deleted reference or a provider
            // That failed on one this dashboard still names — and the reply deliberately does not carry it
            console.error(error);
            throw getNotFoundError("Dataset", dataset.reference.id);
          },
        );
        return { ...bakedVisual, dataset: { ...dataset, snapshot: projectDatasetToQuery(snapshot, dataset.query) } };
      }),
    );
  return { ...dashboard, visuals: await bakeVisuals(dashboard.visuals) };
};
