import ApplicationTags from "#src/azure/constants/ApplicationTags";
import AzureAustraliaEastLocation from "#src/azure/constants/AzureAustraliaEastLocation";
import AzureBudgetActionWorkflowTriggers from "#src/azure/constants/AzureBudgetActionWorkflowTriggers";
import AzureLogicAppEndpointsConfiguration from "#src/azure/constants/AzureLogicAppEndpointsConfiguration";
import AzureResourceManagerManagedApiId from "#src/azure/constants/AzureResourceManagerManagedApiId";
import ProdEventSubscriptionGuardTargets from "#src/azure/constants/ProdEventSubscriptionGuardTargets";
import { prodEvgtEsposterAe001 } from "#src/azure/resources/Microsoft.EventGrid/topics/prodEvgtEsposterAe001";
import { prodRgEsposterAe001 } from "#src/azure/resources/Microsoft.Resources/resourceGroups/prodRgEsposterAe001";
import { prodApicEsposterAe003 } from "#src/azure/resources/Microsoft.Web/connections/prodApicEsposterAe003";
import { getEventSubscriptionDeleteActions } from "#src/azure/services/getEventSubscriptionDeleteActions";
import { getWorkflowConnectionParameters } from "#src/azure/services/getWorkflowConnectionParameters";
import { getWorkflowDefinition } from "#src/azure/services/getWorkflowDefinition";
import * as azure_native from "@pulumi/azure-native";

const workflowName = "prod-logic-esposter-ae-003";

export const prodLogicEsposterAe003: azure_native.logic.Workflow = new azure_native.logic.Workflow(
  workflowName,
  {
    definition: getWorkflowDefinition(
      getEventSubscriptionDeleteActions(
        prodApicEsposterAe003,
        prodRgEsposterAe001,
        prodEvgtEsposterAe001,
        ProdEventSubscriptionGuardTargets,
      ),
      AzureBudgetActionWorkflowTriggers,
    ),
    endpointsConfiguration: AzureLogicAppEndpointsConfiguration,
    identity: {
      type: azure_native.logic.ManagedServiceIdentityType.SystemAssigned,
    },
    location: AzureAustraliaEastLocation,
    parameters: getWorkflowConnectionParameters(prodApicEsposterAe003, AzureResourceManagerManagedApiId),
    resourceGroupName: prodRgEsposterAe001.name,
    state: azure_native.logic.WorkflowState.Enabled,
    tags: {
      ...ApplicationTags,
    },
    workflowName,
  },
  {
    parent: prodRgEsposterAe001,
    protect: true,
  },
);
