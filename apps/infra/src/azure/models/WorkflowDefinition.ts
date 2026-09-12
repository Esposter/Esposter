import type { ApiConnectionAction } from "#src/azure/models/ApiConnectionAction";

export interface WorkflowDefinition {
  $schema: string;
  actions: Record<string, ApiConnectionAction>;
  contentVersion: string;
  parameters: { $connections: { type: "Object" } };
  triggers: Record<string, unknown>;
}
