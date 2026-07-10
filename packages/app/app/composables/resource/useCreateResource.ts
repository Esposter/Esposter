import type { CreatableResourceType } from "@/services/resource/CreatableResourceTypes";

import { ResourceType } from "@esposter/db-schema";
// Dispatches to each creatable type's createResourceProcedures-backed router. Keys are the transitional
// Legacy router names (tableEditor/emailEditor/…) until the Phase 3-4 renames, so the map is explicit.
export const useCreateResource = () => {
  const { $trpc } = useNuxtApp();
  const ResourceCreateProcedureMap = {
    [ResourceType.Dashboard]: $trpc.dashboard.createResource,
    [ResourceType.Email]: $trpc.emailEditor.createResource,
    [ResourceType.File]: $trpc.file.createResource,
    [ResourceType.Flowchart]: $trpc.flowchartEditor.createResource,
    [ResourceType.Survey]: $trpc.survey.createResource,
    [ResourceType.TodoList]: $trpc.todoList.createResource,
    [ResourceType.Webpage]: $trpc.webpageEditor.createResource,
  } satisfies Record<CreatableResourceType, unknown>;
  return (type: CreatableResourceType, name: string) => ResourceCreateProcedureMap[type].mutate({ name });
};
