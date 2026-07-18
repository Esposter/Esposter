import { AzureTable } from "@/models/azure/table/AzureTable";
import { ResourceType } from "@/models/resource/ResourceType";

// Azure Table partitions a resource type owns under its own resource id, cleared when the resource is
// Purged. ResourceViews is deliberately absent: it belongs to the factory's own view-counting
// Capability rather than to any one type, so it is cleared for every type unconditionally.
// It lives here rather than in the app because the Recycle bin's timer purge runs in azure-functions
export const ResourceOwnedTablesMap: Record<ResourceType, AzureTable[]> = {
  [ResourceType.Blueprint]: [],
  [ResourceType.Dashboard]: [],
  [ResourceType.Email]: [],
  [ResourceType.Flowchart]: [],
  [ResourceType.Program]: [AzureTable.ProgramParticipants],
  [ResourceType.Sheet]: [],
  [ResourceType.Survey]: [AzureTable.SurveyResponses],
  [ResourceType.TodoList]: [],
  [ResourceType.Webpage]: [],
};
