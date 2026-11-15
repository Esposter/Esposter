import type { PublishableResourceType } from "#shared/models/resource/PublishableResourceType";

import { ResourceType } from "@esposter/db-schema";

// Public view renderers dispatched by /view/[type]/[id]. Loaded on demand for the same reason as the editors: a
// Visitor opening one published resource has no use for the renderers of the five types they did not open
export const ViewComponentMap: Record<PublishableResourceType, Component> = {
  [ResourceType.Dashboard]: defineAsyncComponent(() => import("#src/components/Resource/Dashboard/View.vue")),
  [ResourceType.Email]: defineAsyncComponent(() => import("#src/components/Resource/Email/View.vue")),
  [ResourceType.Note]: defineAsyncComponent(() => import("#src/components/Resource/Note/View.vue")),
  [ResourceType.Survey]: defineAsyncComponent(() => import("#src/components/Resource/Survey/View.vue")),
  [ResourceType.Webpage]: defineAsyncComponent(() => import("#src/components/Resource/Webpage/View.vue")),
};
