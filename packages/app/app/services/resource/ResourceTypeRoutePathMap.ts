import { RESOURCE_ID_QUERY_PARAMETER_KEY } from "@/services/shared/constants";
import { ResourceType } from "@esposter/db-schema";
import { RoutePath } from "@esposter/shared";
// Deep-links the explorer to each type's editor. Until the blade shell lands (platform roadmap Phase 2+),
// Editors are still top-level pages keyed by the resourceId query param.
const withResourceId = (path: string) => (id: string) => `${path}?${RESOURCE_ID_QUERY_PARAMETER_KEY}=${id}`;

export const ResourceTypeRoutePathMap = {
  [ResourceType.Dashboard]: withResourceId(RoutePath.DashboardEditor),
  [ResourceType.Email]: withResourceId(RoutePath.EmailEditor),
  [ResourceType.File]: withResourceId(RoutePath.TableEditor),
  [ResourceType.Flowchart]: withResourceId(RoutePath.FlowchartEditor),
  [ResourceType.Survey]: (id: string) => RoutePath.SurveyerEdit(id),
  [ResourceType.Table]: withResourceId(RoutePath.TableEditor),
  [ResourceType.TodoList]: withResourceId(RoutePath.TableEditor),
  [ResourceType.Webpage]: withResourceId(RoutePath.WebpageEditor),
} as const satisfies Record<ResourceType, (id: string) => string>;
