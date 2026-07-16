import type { PublishableResourceType } from "#shared/models/resource/PublishableResourceType";

import ResourceDashboardView from "@/components/Resource/Dashboard/View.vue";
import ResourceSurveyView from "@/components/Resource/Survey/View.vue";
import ResourceWebpageView from "@/components/Resource/Webpage/View.vue";
import { ResourceType } from "@esposter/db-schema";
// Public view renderers dispatched by /view/[type]/[id]
export const ViewComponentMap: Record<PublishableResourceType, Component> = {
  [ResourceType.Dashboard]: ResourceDashboardView,
  [ResourceType.Survey]: ResourceSurveyView,
  [ResourceType.Webpage]: ResourceWebpageView,
};
