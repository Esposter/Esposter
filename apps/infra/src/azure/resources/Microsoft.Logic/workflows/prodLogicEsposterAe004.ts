import ApplicationTags from "#src/azure/constants/ApplicationTags";
import AzureAustraliaEastLocation from "#src/azure/constants/AzureAustraliaEastLocation";
import AzureLogicAppEndpointsConfiguration from "#src/azure/constants/AzureLogicAppEndpointsConfiguration";
import AzureMonthlyRecurrenceWorkflowTriggers from "#src/azure/constants/AzureMonthlyRecurrenceWorkflowTriggers";
import AzureResourceManagerManagedApiId from "#src/azure/constants/AzureResourceManagerManagedApiId";
import ProdEventSubscriptionGuardTargets from "#src/azure/constants/ProdEventSubscriptionGuardTargets";
import { prodEvgtEsposterAe001 } from "#src/azure/resources/Microsoft.EventGrid/topics/prodEvgtEsposterAe001";
import { prodRgEsposterAe001 } from "#src/azure/resources/Microsoft.Resources/resourceGroups/prodRgEsposterAe001";
import { prodstesposter001Deadletter } from "#src/azure/resources/Microsoft.Storage/storageAccounts/blobContainers/prodstesposter001Deadletter";
import { prodstesposter001 } from "#src/azure/resources/Microsoft.Storage/storageAccounts/prodstesposter001";
import { prodApicEsposterAe004 } from "#src/azure/resources/Microsoft.Web/connections/prodApicEsposterAe004";
import { prodFuncEsposter001 } from "#src/azure/resources/Microsoft.Web/sites/prodFuncEsposter001";
import { getEventSubscriptionRestoreActions } from "#src/azure/services/getEventSubscriptionRestoreActions";
import { getWorkflowConnectionParameters } from "#src/azure/services/getWorkflowConnectionParameters";
import { getWorkflowDefinition } from "#src/azure/services/getWorkflowDefinition";
import * as azure_native from "@pulumi/azure-native";

const workflowName = "prod-logic-esposter-ae-004";

export const prodLogicEsposterAe004: azure_native.logic.Workflow = new azure_native.logic.Workflow(
  workflowName,
  {
    definition: getWorkflowDefinition(
      getEventSubscriptionRestoreActions({
        connection: prodApicEsposterAe004,
        deadLetterContainer: prodstesposter001Deadletter,
        resourceGroup: prodRgEsposterAe001,
        site: prodFuncEsposter001,
        storageAccount: prodstesposter001,
        targets: ProdEventSubscriptionGuardTargets,
        topic: prodEvgtEsposterAe001,
      }),
      AzureMonthlyRecurrenceWorkflowTriggers,
    ),
    endpointsConfiguration: AzureLogicAppEndpointsConfiguration,
    identity: {
      type: azure_native.logic.ManagedServiceIdentityType.SystemAssigned,
    },
    location: AzureAustraliaEastLocation,
    parameters: getWorkflowConnectionParameters(prodApicEsposterAe004, AzureResourceManagerManagedApiId),
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
