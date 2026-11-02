import { ResourceType } from "@esposter/db-schema";

// Explorer-creatable types: those backed by createResourceProcedures on the resources table, so a create
// Immediately shows up in resource.readResources.
export const CreatableResourceTypes = [
  ResourceType.Sheet,
  ResourceType.TodoList,
  ResourceType.Dashboard,
  ResourceType.Webpage,
  ResourceType.Email,
  ResourceType.Note,
  ResourceType.Survey,
  ResourceType.Blueprint,
  ResourceType.Whiteboard,
] as const;

export type CreatableResourceType = (typeof CreatableResourceTypes)[number];
