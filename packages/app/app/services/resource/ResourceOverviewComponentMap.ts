import ResourceSurveyOverview from "@/components/Resource/Survey/Overview.vue";
import { ResourceType } from "@esposter/db-schema";
// A type that wants more than the built-in Essentials wraps ResourceOverview and fills its slots.
// Types with no entry render the generic ResourceOverview directly.
export const ResourceOverviewComponentMap: Partial<Record<ResourceType, Component>> = {
  [ResourceType.Survey]: ResourceSurveyOverview,
};
