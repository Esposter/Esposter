import { AzureTable, ResourceType } from "@esposter/db-schema";

// Azure Table partitions a resource type owns under its own resource id, cleared when the resource is
// Deleted. ResourceViews is deliberately absent: it belongs to the factory's own view-counting
// Capability rather than to any one type, so it is cleared for every type unconditionally
export const ResourceOwnedTablesMap: Record<ResourceType, AzureTable[]> = {
  [ResourceType.Dashboard]: [],
  [ResourceType.Email]: [],
  [ResourceType.Flowchart]: [],
  [ResourceType.Program]: [AzureTable.ProgramInvites],
  [ResourceType.Sheet]: [],
  [ResourceType.Survey]: [],
  [ResourceType.TodoList]: [],
  [ResourceType.Webpage]: [],
};
