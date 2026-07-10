import type { PublishableResourceType } from "#shared/models/resource/PublishableResourceType";

import ResourceDashboardView from "@/components/Resource/Dashboard/View.vue";
import ResourceWebpageView from "@/components/Resource/Webpage/View.vue";
import { ResourceType } from "@esposter/db-schema";
// Public view renderers migrate into this map as each publishable type moves off its per-type view page
// (roadmap Phase 3/5). Empty skeleton dispatched by /view/[type]/[id]; tightens to a full Record as they land.
export const ViewComponentMap: Partial<Record<PublishableResourceType, Component>> = {
  [ResourceType.Dashboard]: ResourceDashboardView,
  [ResourceType.Webpage]: ResourceWebpageView,
};
