import ApplicationTags from "@/constants/ApplicationTags";
import AzureAppServiceManagedApiId from "@/constants/AzureAppServiceManagedApiId";
import AzureAustraliaEastLocation from "@/constants/AzureAustraliaEastLocation";
import { dShpRgEsposterAuea001 } from "@/resources/Microsoft.Resources/resourceGroups/dShpRgEsposterAuea001";
import { devApicnEsposterAuea002 } from "@/resources/Microsoft.Web/connections/devApicnEsposterAuea002";
import * as azure_native from "@pulumi/azure-native";

export const devLogicEsposterAuea002: azure_native.logic.Workflow = new azure_native.logic.Workflow(
  "dev-logic-esposter-auea-002",
  {
    definition: {
      $schema:
        "https://schema.management.azure.com/providers/Microsoft.Logic/schemas/2016-06-01/workflowdefinition.json#",
      actions: {
        Start_Function_App: {
          inputs: {
            host: {
              connection: {
                name: "@parameters('$connections')['dev-apicn-esposter-auea-002']['connectionId']",
              },
            },
            method: "post",
            path: "/subscriptions/@{encodeURIComponent('764658ba-01da-43fa-9f26-ffa4ada33ebb')}/resourcegroups/@{encodeURIComponent('d-shp-rg-esposter-auea-001')}/providers/Microsoft.Web/sites/@{encodeURIComponent('d-shp-func-esposter-auea-001')}/start",
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
    endpointsConfiguration: {
      connector: {
        outgoingIpAddresses: [
          {
            address: "52.237.214.72",
          },
          {
            address: "13.72.243.10",
          },
          {
            address: "13.70.72.192/28",
          },
          {
            address: "13.70.78.224/27",
          },
          {
            address: "20.70.220.224/28",
          },
          {
            address: "20.70.220.192/27",
          },
          {
            address: "20.213.202.84",
          },
          {
            address: "20.213.202.51",
          },
        ],
      },
      workflow: {
        accessEndpointIpAddresses: [
          {
            address: "20.11.76.135",
          },
          {
            address: "20.11.77.54",
          },
          {
            address: "4.200.57.191",
          },
          {
            address: "20.11.77.111",
          },
          {
            address: "4.200.48.30",
          },
          {
            address: "4.198.185.192",
          },
          {
            address: "4.200.48.37",
          },
          {
            address: "4.200.57.70",
          },
        ],
        outgoingIpAddresses: [
          {
            address: "20.53.72.170",
          },
          {
            address: "20.53.106.182",
          },
          {
            address: "20.11.76.122",
          },
          {
            address: "20.11.77.49",
          },
          {
            address: "4.200.57.71",
          },
          {
            address: "20.11.77.107",
          },
          {
            address: "4.198.187.22",
          },
          {
            address: "4.198.185.90",
          },
          {
            address: "4.198.185.246",
          },
          {
            address: "4.200.58.227",
          },
        ],
      },
    },
    identity: {
      type: azure_native.logic.ManagedServiceIdentityType.SystemAssigned,
    },
    location: AzureAustraliaEastLocation,
    parameters: {
      $connections: {
        value: {
          "dev-apicn-esposter-auea-002": {
            connectionId: devApicnEsposterAuea002.id,
            connectionName: "dev-apicn-esposter-auea-002",
            connectionProperties: {
              authentication: {
                type: "ManagedServiceIdentity",
              },
            },
            id: AzureAppServiceManagedApiId,
          },
        },
      },
    },
    resourceGroupName: dShpRgEsposterAuea001.name,
    state: azure_native.logic.WorkflowState.Enabled,
    tags: {
      ...ApplicationTags,
    },
    workflowName: "dev-logic-esposter-auea-002",
  },
  {
    protect: true,
  },
);
