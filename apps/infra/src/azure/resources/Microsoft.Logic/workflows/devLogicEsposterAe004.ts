import ApplicationTags from "#src/azure/constants/ApplicationTags";
import AzureAustraliaEastLocation from "#src/azure/constants/AzureAustraliaEastLocation";
import AzureLogicAppEndpointsConfiguration from "#src/azure/constants/AzureLogicAppEndpointsConfiguration";
import AzureMonthlyRecurrenceWorkflowTriggers from "#src/azure/constants/AzureMonthlyRecurrenceWorkflowTriggers";
import AzureResourceManagerManagedApiId from "#src/azure/constants/AzureResourceManagerManagedApiId";
import DevEventSubscriptionGuardTargets from "#src/azure/constants/DevEventSubscriptionGuardTargets";
import { devEvgtEsposterAe001 } from "#src/azure/resources/Microsoft.EventGrid/topics/devEvgtEsposterAe001";
import { devRgEsposterAe001 } from "#src/azure/resources/Microsoft.Resources/resourceGroups/devRgEsposterAe001";
import { devstesposter001Deadletter } from "#src/azure/resources/Microsoft.Storage/storageAccounts/blobContainers/devstesposter001Deadletter";
import { devstesposter001 } from "#src/azure/resources/Microsoft.Storage/storageAccounts/devstesposter001";
import { devApicEsposterAe004 } from "#src/azure/resources/Microsoft.Web/connections/devApicEsposterAe004";
import { devFuncEsposter001 } from "#src/azure/resources/Microsoft.Web/sites/devFuncEsposter001";
import { getEventSubscriptionRestoreActions } from "#src/azure/services/getEventSubscriptionRestoreActions";
import { getWorkflowConnectionParameters } from "#src/azure/services/getWorkflowConnectionParameters";
import { getWorkflowDefinition } from "#src/azure/services/getWorkflowDefinition";
import * as azure_native from "@pulumi/azure-native";

const workflowName = "dev-logic-esposter-ae-004";

export const devLogicEsposterAe004: azure_native.logic.Workflow = new azure_native.logic.Workflow(
  workflowName,
  {
    definition: getWorkflowDefinition(
      getEventSubscriptionRestoreActions({
        connection: devApicEsposterAe004,
        deadLetterContainer: devstesposter001Deadletter,
        resourceGroup: devRgEsposterAe001,
        site: devFuncEsposter001,
        storageAccount: devstesposter001,
        targets: DevEventSubscriptionGuardTargets,
        topic: devEvgtEsposterAe001,
      }),
      AzureMonthlyRecurrenceWorkflowTriggers,
    ),
    endpointsConfiguration: AzureLogicAppEndpointsConfiguration,
    identity: {
      type: azure_native.logic.ManagedServiceIdentityType.SystemAssigned,
    },
    location: AzureAustraliaEastLocation,
    parameters: getWorkflowConnectionParameters(devApicEsposterAe004, AzureResourceManagerManagedApiId),
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
