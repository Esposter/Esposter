import type { CreatableResourceType } from "@/services/resource/CreatableResourceTypes";

import { ResourceType } from "@esposter/db-schema";
// Dispatches to each creatable type's createResourceProcedures-backed router via an explicit per-type map.
export const useCreateResource = () => {
  const { $trpc } = useNuxtApp();
  const ResourceCreateProcedureMap = {
    [ResourceType.Blueprint]: $trpc.blueprint.createResource,
    [ResourceType.Dashboard]: $trpc.dashboard.createResource,
    [ResourceType.Email]: $trpc.email.createResource,
    [ResourceType.Flowchart]: $trpc.flowchart.createResource,
    [ResourceType.Sheet]: $trpc.sheet.createResource,
    [ResourceType.Survey]: $trpc.survey.createResource,
    [ResourceType.TodoList]: $trpc.todoList.createResource,
    [ResourceType.Webpage]: $trpc.webpage.createResource,
  } satisfies Record<CreatableResourceType, unknown>;
  return (type: CreatableResourceType, name: string) => ResourceCreateProcedureMap[type].mutate({ name });
};
