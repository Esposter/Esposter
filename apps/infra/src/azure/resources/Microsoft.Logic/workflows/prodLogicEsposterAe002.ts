import ApplicationTags from "#src/azure/constants/ApplicationTags";
import AzureAppServiceManagedApiId from "#src/azure/constants/AzureAppServiceManagedApiId";
import AzureAustraliaEastLocation from "#src/azure/constants/AzureAustraliaEastLocation";
import AzureLogicAppEndpointsConfiguration from "#src/azure/constants/AzureLogicAppEndpointsConfiguration";
import AzureMonthlyRecurrenceWorkflowTriggers from "#src/azure/constants/AzureMonthlyRecurrenceWorkflowTriggers";
import { FunctionAppPowerAction } from "#src/azure/models/FunctionAppPowerAction";
import { prodRgEsposterAe001 } from "#src/azure/resources/Microsoft.Resources/resourceGroups/prodRgEsposterAe001";
import { prodApicEsposterAe002 } from "#src/azure/resources/Microsoft.Web/connections/prodApicEsposterAe002";
import { prodFuncEsposter001 } from "#src/azure/resources/Microsoft.Web/sites/prodFuncEsposter001";
import { getFunctionAppPowerAction } from "#src/azure/services/getFunctionAppPowerAction";
import { getWorkflowConnectionParameters } from "#src/azure/services/getWorkflowConnectionParameters";
import { getWorkflowDefinition } from "#src/azure/services/getWorkflowDefinition";
import * as azure_native from "@pulumi/azure-native";

const workflowName = "prod-logic-esposter-ae-002";

export const prodLogicEsposterAe002: azure_native.logic.Workflow = new azure_native.logic.Workflow(
  workflowName,
  {
    definition: getWorkflowDefinition(
      {
        Start_Function_App: getFunctionAppPowerAction(
          prodApicEsposterAe002,
          prodRgEsposterAe001,
          prodFuncEsposter001,
          FunctionAppPowerAction.Start,
        ),
      },
      AzureMonthlyRecurrenceWorkflowTriggers,
    ),
    endpointsConfiguration: AzureLogicAppEndpointsConfiguration,
    identity: {
      type: azure_native.logic.ManagedServiceIdentityType.SystemAssigned,
    },
    location: AzureAustraliaEastLocation,
    parameters: getWorkflowConnectionParameters(prodApicEsposterAe002, AzureAppServiceManagedApiId),
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
