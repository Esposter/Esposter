import type { ApiConnectionAction } from "#src/azure/models/ApiConnectionAction";
import type { WorkflowDefinition } from "#src/azure/models/WorkflowDefinition";

// The shell every guard workflow shares: one `$connections` parameter and the connector actions wired to it
export const getWorkflowDefinition = (
  actions: Record<string, ApiConnectionAction>,
  triggers: WorkflowDefinition["triggers"],
): WorkflowDefinition => ({
  $schema: "https://schema.management.azure.com/providers/Microsoft.Logic/schemas/2016-06-01/workflowdefinition.json#",
  actions,
  contentVersion: "1.0.0.0",
  parameters: {
    $connections: {
      type: "Object",
    },
  },
  triggers,
});
