import ApplicationTags from "#src/azure/constants/ApplicationTags";
import AzureAppServiceManagedApiId from "#src/azure/constants/AzureAppServiceManagedApiId";
import AzureAustraliaEastLocation from "#src/azure/constants/AzureAustraliaEastLocation";
import AzureBudgetActionWorkflowTriggers from "#src/azure/constants/AzureBudgetActionWorkflowTriggers";
import AzureLogicAppEndpointsConfiguration from "#src/azure/constants/AzureLogicAppEndpointsConfiguration";
import { FunctionAppPowerAction } from "#src/azure/models/FunctionAppPowerAction";
import { devRgEsposterAe001 } from "#src/azure/resources/Microsoft.Resources/resourceGroups/devRgEsposterAe001";
import { devApicEsposterAe001 } from "#src/azure/resources/Microsoft.Web/connections/devApicEsposterAe001";
import { devFuncEsposter001 } from "#src/azure/resources/Microsoft.Web/sites/devFuncEsposter001";
import { getFunctionAppPowerAction } from "#src/azure/services/getFunctionAppPowerAction";
import { getWorkflowConnectionParameters } from "#src/azure/services/getWorkflowConnectionParameters";
import { getWorkflowDefinition } from "#src/azure/services/getWorkflowDefinition";
import * as azure_native from "@pulumi/azure-native";

const workflowName = "dev-logic-esposter-ae-001";

export const devLogicEsposterAe001: azure_native.logic.Workflow = new azure_native.logic.Workflow(
  workflowName,
  {
    definition: {
      ...getWorkflowDefinition(
        {
          Stop_Function_App: getFunctionAppPowerAction(
            devApicEsposterAe001,
            devRgEsposterAe001,
            devFuncEsposter001,
            FunctionAppPowerAction.Stop,
          ),
        },
        AzureBudgetActionWorkflowTriggers,
      ),
      staticResults: {
        Stop_web_app0: {
          hasDelegate: false,
          status: "Succeeded",
        },
      },
    },
    endpointsConfiguration: AzureLogicAppEndpointsConfiguration,
    identity: {
      type: azure_native.logic.ManagedServiceIdentityType.SystemAssigned,
    },
    location: AzureAustraliaEastLocation,
    parameters: getWorkflowConnectionParameters(devApicEsposterAe001, AzureAppServiceManagedApiId),
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
