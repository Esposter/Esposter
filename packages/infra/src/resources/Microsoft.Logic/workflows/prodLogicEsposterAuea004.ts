import ApplicationTags from "@/constants/ApplicationTags";
import AzureAustraliaEastLocation from "@/constants/AzureAustraliaEastLocation";
import AzureResourceManagerManagedApiId from "@/constants/AzureResourceManagerManagedApiId";
import AzureSubscriptionId from "@/constants/AzureSubscriptionId";
import PShpRgEsposterAuea001Name from "@/constants/PShpRgEsposterAuea001Name";
import { pShpEvgtsEsposterAuea001 } from "@/resources/Microsoft.EventGrid/eventSubscriptions/pShpEvgtsEsposterAuea001";
import { pShpEvgtsEsposterAuea002 } from "@/resources/Microsoft.EventGrid/eventSubscriptions/pShpEvgtsEsposterAuea002";
import { pShpEvgtEsposterAuea001 } from "@/resources/Microsoft.EventGrid/topics/pShpEvgtEsposterAuea001";
import { pShpRgEsposterAuea001 } from "@/resources/Microsoft.Resources/resourceGroups/pShpRgEsposterAuea001";
import { pShpFuncEsposterAuea001 } from "@/resources/Microsoft.Web/sites/pShpFuncEsposterAuea001";
import { prodApicnEsposterAuea004 } from "@/resources/Microsoft.Web/connections/prodApicnEsposterAuea004";
import * as azure_native from "@pulumi/azure-native";
import * as pulumi from "@pulumi/pulumi";

export const prodLogicEsposterAuea004: azure_native.logic.Workflow = new azure_native.logic.Workflow(
  "prod-logic-esposter-auea-004",
  {
    definition: {
      $schema:
        "https://schema.management.azure.com/providers/Microsoft.Logic/schemas/2016-06-01/workflowdefinition.json#",
      actions: {
        Create_ProcessPushNotification_Event_Subscription: {
          inputs: {
            body: {
              properties: {
                destination: {
                  endpointType: "AzureFunction",
                  properties: {
                    maxEventsPerBatch: 1,
                    preferredBatchSizeInKilobytes: 64,
                    resourceId: pulumi.interpolate`${pShpFuncEsposterAuea001.id}/functions/ProcessPushNotification`,
                  },
                },
                eventDeliverySchema: "EventGridSchema",
                filter: {
                  enableAdvancedFilteringOnArrays: true,
                  includedEventTypes: ["ProcessPushNotification"],
                  subjectBeginsWith: "",
                  subjectEndsWith: "",
                },
                id: pShpEvgtsEsposterAuea002.id,
                name: "p-shp-evgts-esposter-auea-002",
                resourceGroup: PShpRgEsposterAuea001Name,
                retryPolicy: {
                  eventTimeToLiveInMinutes: 1440,
                  maxDeliveryAttempts: 30,
                },
                topic: pShpEvgtEsposterAuea001.id,
                type: "Microsoft.EventGrid/eventSubscriptions",
              },
            },
            host: {
              connection: {
                name: "@parameters('$connections')['prod-apicn-esposter-auea-004']['connectionId']",
              },
            },
            method: "put",
            path: `/subscriptions/@{encodeURIComponent('${AzureSubscriptionId}')}/resourcegroups/@{encodeURIComponent('${PShpRgEsposterAuea001Name}')}/providers/@{encodeURIComponent('Microsoft.EventGrid')}/@{encodeURIComponent('topics/p-shp-evgt-esposter-auea-001/eventSubscriptions/p-shp-evgts-esposter-auea-002')}`,
            queries: {
              "x-ms-api-version": "2025-02-15",
            },
          },
          runAfter: {
            Read_ProcessPushNotification_Event_Subscription: ["Failed"],
          },
          type: "ApiConnection",
        },
        Create_ProcessWebhook_Event_Subscription: {
          inputs: {
            body: {
              properties: {
                destination: {
                  endpointType: "AzureFunction",
                  properties: {
                    maxEventsPerBatch: 1,
                    preferredBatchSizeInKilobytes: 64,
                    resourceId: pulumi.interpolate`${pShpFuncEsposterAuea001.id}/functions/ProcessWebhook`,
                  },
                },
                eventDeliverySchema: "EventGridSchema",
                filter: {
                  enableAdvancedFilteringOnArrays: true,
                  includedEventTypes: ["ProcessWebhook"],
                  subjectBeginsWith: "",
                  subjectEndsWith: "",
                },
                id: pShpEvgtsEsposterAuea001.id,
                name: "p-shp-evgts-esposter-auea-001",
                resourceGroup: PShpRgEsposterAuea001Name,
                retryPolicy: {
                  eventTimeToLiveInMinutes: 1440,
                  maxDeliveryAttempts: 30,
                },
                topic: pShpEvgtEsposterAuea001.id,
                type: "Microsoft.EventGrid/eventSubscriptions",
              },
            },
            host: {
              connection: {
                name: "@parameters('$connections')['prod-apicn-esposter-auea-004']['connectionId']",
              },
            },
            method: "put",
            path: `/subscriptions/@{encodeURIComponent('${AzureSubscriptionId}')}/resourcegroups/@{encodeURIComponent('${PShpRgEsposterAuea001Name}')}/providers/@{encodeURIComponent('Microsoft.EventGrid')}/@{encodeURIComponent('topics/p-shp-evgt-esposter-auea-001/eventSubscriptions/p-shp-evgts-esposter-auea-001')}`,
            queries: {
              "x-ms-api-version": "2025-02-15",
            },
          },
          runAfter: {
            Read_ProcessWebhook_Event_Subscription: ["Failed"],
          },
          type: "ApiConnection",
        },
        Read_ProcessPushNotification_Event_Subscription: {
          inputs: {
            host: {
              connection: {
                name: "@parameters('$connections')['prod-apicn-esposter-auea-004']['connectionId']",
              },
            },
            method: "get",
            path: `/subscriptions/@{encodeURIComponent('${AzureSubscriptionId}')}/resourcegroups/@{encodeURIComponent('${PShpRgEsposterAuea001Name}')}/providers/@{encodeURIComponent('Microsoft.EventGrid')}/@{encodeURIComponent('topics/p-shp-evgt-esposter-auea-001/eventSubscriptions/p-shp-evgts-esposter-auea-002')}`,
            queries: {
              "x-ms-api-version": "2025-02-15",
            },
          },
          type: "ApiConnection",
        },
        Read_ProcessWebhook_Event_Subscription: {
          inputs: {
            host: {
              connection: {
                name: "@parameters('$connections')['prod-apicn-esposter-auea-004']['connectionId']",
              },
            },
            method: "get",
            path: `/subscriptions/@{encodeURIComponent('${AzureSubscriptionId}')}/resourcegroups/@{encodeURIComponent('${PShpRgEsposterAuea001Name}')}/providers/@{encodeURIComponent('Microsoft.EventGrid')}/@{encodeURIComponent('topics/p-shp-evgt-esposter-auea-001/eventSubscriptions/p-shp-evgts-esposter-auea-001')}`,
            queries: {
              "x-ms-api-version": "2025-02-15",
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
          "prod-apicn-esposter-auea-004": {
            connectionId: prodApicnEsposterAuea004.id,
            connectionName: "prod-apicn-esposter-auea-004",
            connectionProperties: {
              authentication: {
                type: "ManagedServiceIdentity",
              },
            },
            id: AzureResourceManagerManagedApiId,
          },
        },
      },
    },
    resourceGroupName: pShpRgEsposterAuea001.name,
    state: azure_native.logic.WorkflowState.Enabled,
    tags: {
      ...ApplicationTags,
    },
    workflowName: "prod-logic-esposter-auea-004",
  },
  {
    protect: true,
  },
);
