import ApplicationTags from "#src/azure/constants/ApplicationTags";
import AzureAustraliaEastLocation from "#src/azure/constants/AzureAustraliaEastLocation";
import AzureBudgetActionWorkflowTriggers from "#src/azure/constants/AzureBudgetActionWorkflowTriggers";
import AzureLogicAppEndpointsConfiguration from "#src/azure/constants/AzureLogicAppEndpointsConfiguration";
import AzureResourceManagerManagedApiId from "#src/azure/constants/AzureResourceManagerManagedApiId";
import DevEventSubscriptionGuardTargets from "#src/azure/constants/DevEventSubscriptionGuardTargets";
import { devEvgtEsposterAe001 } from "#src/azure/resources/Microsoft.EventGrid/topics/devEvgtEsposterAe001";
import { devRgEsposterAe001 } from "#src/azure/resources/Microsoft.Resources/resourceGroups/devRgEsposterAe001";
import { devApicEsposterAe003 } from "#src/azure/resources/Microsoft.Web/connections/devApicEsposterAe003";
import { getEventSubscriptionDeleteActions } from "#src/azure/services/getEventSubscriptionDeleteActions";
import { getWorkflowConnectionParameters } from "#src/azure/services/getWorkflowConnectionParameters";
import { getWorkflowDefinition } from "#src/azure/services/getWorkflowDefinition";
import * as azure_native from "@pulumi/azure-native";

const workflowName = "dev-logic-esposter-ae-003";

export const devLogicEsposterAe003: azure_native.logic.Workflow = new azure_native.logic.Workflow(
  workflowName,
  {
    definition: getWorkflowDefinition(
      getEventSubscriptionDeleteActions(
        devApicEsposterAe003,
        devRgEsposterAe001,
        devEvgtEsposterAe001,
        DevEventSubscriptionGuardTargets,
      ),
      AzureBudgetActionWorkflowTriggers,
    ),
    endpointsConfiguration: AzureLogicAppEndpointsConfiguration,
    identity: {
      type: azure_native.logic.ManagedServiceIdentityType.SystemAssigned,
    },
    location: AzureAustraliaEastLocation,
    parameters: getWorkflowConnectionParameters(devApicEsposterAe003, AzureResourceManagerManagedApiId),
    resourceGroupName: devRgEsposterAe001.name,
    state: azure_native.logic.WorkflowState.Enabled,
    tags: {
      ...ApplicationTags,
    },
    workflowName,
  },
  {
    parent: devRgEsposterAe001,
    protect: true,
  },
);
