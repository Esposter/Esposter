import ApplicationTags from "#src/azure/constants/ApplicationTags";
import AzureAppServiceManagedApiId from "#src/azure/constants/AzureAppServiceManagedApiId";
import AzureAustraliaEastLocation from "#src/azure/constants/AzureAustraliaEastLocation";
import AzureLogicAppEndpointsConfiguration from "#src/azure/constants/AzureLogicAppEndpointsConfiguration";
import AzureMonthlyRecurrenceWorkflowTriggers from "#src/azure/constants/AzureMonthlyRecurrenceWorkflowTriggers";
import { FunctionAppPowerAction } from "#src/azure/models/FunctionAppPowerAction";
import { devRgEsposterAe001 } from "#src/azure/resources/Microsoft.Resources/resourceGroups/devRgEsposterAe001";
import { devApicEsposterAe002 } from "#src/azure/resources/Microsoft.Web/connections/devApicEsposterAe002";
import { devFuncEsposter001 } from "#src/azure/resources/Microsoft.Web/sites/devFuncEsposter001";
import { getFunctionAppPowerAction } from "#src/azure/services/getFunctionAppPowerAction";
import { getWorkflowConnectionParameters } from "#src/azure/services/getWorkflowConnectionParameters";
import { getWorkflowDefinition } from "#src/azure/services/getWorkflowDefinition";
import * as azure_native from "@pulumi/azure-native";

const workflowName = "dev-logic-esposter-ae-002";

export const devLogicEsposterAe002: azure_native.logic.Workflow = new azure_native.logic.Workflow(
  workflowName,
  {
    definition: getWorkflowDefinition(
      {
        Start_Function_App: getFunctionAppPowerAction(
          devApicEsposterAe002,
          devRgEsposterAe001,
          devFuncEsposter001,
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
    parameters: getWorkflowConnectionParameters(devApicEsposterAe002, AzureAppServiceManagedApiId),
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
