import { ResourceType } from "@esposter/db-schema";
// Explorer-creatable types: those backed by createResourceProcedures on the resources table, so a create
// Immediately shows up in resource.readResources. Survey lives on its own surveys table (folds in roadmap
// Phase 5) and File/TodoList have no router yet (roadmap Phase 4), so neither is offered here.
export const CreatableResourceTypes = [
  ResourceType.Table,
  ResourceType.Dashboard,
  ResourceType.Webpage,
  ResourceType.Email,
  ResourceType.Flowchart,
] as const;

export type CreatableResourceType = (typeof CreatableResourceTypes)[number];

export const isCreatableResourceType = (value: string): value is CreatableResourceType =>
  CreatableResourceTypes.some((type) => type === value);
