import ApplicationTags from "@/azure/constants/ApplicationTags";
import AzureAppServiceManagedApiId from "@/azure/constants/AzureAppServiceManagedApiId";
import AzureAustraliaEastLocation from "@/azure/constants/AzureAustraliaEastLocation";
import AzureLogicAppEndpointsConfiguration from "@/azure/constants/AzureLogicAppEndpointsConfiguration";
import { devRgEsposterAe001 } from "@/azure/resources/Microsoft.Resources/resourceGroups/devRgEsposterAe001";
import { devApicEsposterAe002 } from "@/azure/resources/Microsoft.Web/connections/devApicEsposterAe002";
import { getWorkflowConnectionParameters } from "@/azure/services/getWorkflowConnectionParameters";
import * as azure_native from "@pulumi/azure-native";
import * as pulumi from "@pulumi/pulumi";

const workflowName = "dev-logic-esposter-ae-002";

export const devLogicEsposterAe002: azure_native.logic.Workflow = new azure_native.logic.Workflow(
  workflowName,
  {
    definition: {
      $schema:
        "https://schema.management.azure.com/providers/Microsoft.Logic/schemas/2016-06-01/workflowdefinition.json#",
      actions: {
        Start_Function_App: {
          inputs: {
            host: {
              connection: {
                name: pulumi.interpolate`@parameters('$connections')['${devApicEsposterAe002.name}']['connectionId']`,
              },
            },
            method: "post",
            path: "/subscriptions/@{encodeURIComponent('764658ba-01da-43fa-9f26-ffa4ada33ebb')}/resourcegroups/@{encodeURIComponent('dev-rg-esposter-ae-001')}/providers/Microsoft.Web/sites/@{encodeURIComponent('dev-func-esposter-001')}/start",
            queries: {
              "api-version": "2019-08-01",
            },
          },
          type: "ApiConnection",
        },
      },
      contentVersion: "1.0.0.0",
      parameters: {
        $connections: {
          type: "Object",
        },
      },
      triggers: {
        Recurrence: {
          evaluatedRecurrence: {
            frequency: "Month",
            interval: 1,
            startTime: "2025-01-01T00:00:00Z",
            timeZone: "UTC",
          },
          recurrence: {
            frequency: "Month",
            interval: 1,
            startTime: "2025-01-01T00:00:00Z",
            timeZone: "UTC",
          },
          type: "Recurrence",
        },
      },
    },
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
