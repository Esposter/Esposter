import ApplicationTags from "@/constants/ApplicationTags";
import AzureAustraliaEastLocation from "@/constants/AzureAustraliaEastLocation";
import AzureResourceManagerManagedApiId from "@/constants/AzureResourceManagerManagedApiId";
import AzureSubscriptionId from "@/constants/AzureSubscriptionId";
import { devEvgsEsposterAuea001 } from "@/resources/Microsoft.EventGrid/eventSubscriptions/devEvgsEsposterAuea001";
import { devEvgsEsposterAuea002 } from "@/resources/Microsoft.EventGrid/eventSubscriptions/devEvgsEsposterAuea002";
import { dShpEvgtEsposterAuea001 } from "@/resources/Microsoft.EventGrid/topics/dShpEvgtEsposterAuea001";
import { dShpRgEsposterAuea001 } from "@/resources/Microsoft.Resources/resourceGroups/dShpRgEsposterAuea001";
import { devApicEsposterAuea004 } from "@/resources/Microsoft.Web/connections/devApicEsposterAuea004";
import { dShpFuncEsposterAuea001 } from "@/resources/Microsoft.Web/sites/dShpFuncEsposterAuea001";
import { AzureFunction } from "@esposter/db-schema";
import * as azure_native from "@pulumi/azure-native";
import * as pulumi from "@pulumi/pulumi";

const connectionKey = "dev-apic-esposter-auea-004";
const workflowName = "dev-logic-esposter-auea-004";

export const devLogicEsposterAuea004: azure_native.logic.Workflow = new azure_native.logic.Workflow(
  workflowName,
  {
    definition: {
      $schema:
        "https://schema.management.azure.com/providers/Microsoft.Logic/schemas/2016-06-01/workflowdefinition.json#",
      actions: {
        [`Create_${AzureFunction.ProcessPushNotification}_Event_Subscription`]: {
          inputs: {
            body: {
              properties: {
                destination: {
                  endpointType: "AzureFunction",
                  properties: {
                    maxEventsPerBatch: 1,
                    preferredBatchSizeInKilobytes: 64,
                    resourceId: pulumi.interpolate`${dShpFuncEsposterAuea001.id}/functions/${AzureFunction.ProcessPushNotification}`,
                  },
                },
                eventDeliverySchema: "EventGridSchema",
                filter: {
                  enableAdvancedFilteringOnArrays: true,
                  includedEventTypes: [AzureFunction.ProcessPushNotification],
                  subjectBeginsWith: "",
                  subjectEndsWith: "",
                },
                id: devEvgsEsposterAuea002.id,
                name: devEvgsEsposterAuea002.name,
                resourceGroup: dShpRgEsposterAuea001.name,
                retryPolicy: {
                  eventTimeToLiveInMinutes: 1440,
                  maxDeliveryAttempts: 30,
                },
                topic: dShpEvgtEsposterAuea001.id,
                type: "Microsoft.EventGrid/eventSubscriptions",
              },
            },
            host: {
              connection: {
                name: `@parameters('$connections')['${connectionKey}']['connectionId']`,
              },
            },
            method: "put",
            path: pulumi.interpolate`/subscriptions/@{encodeURIComponent('${AzureSubscriptionId}')}/resourcegroups/@{encodeURIComponent('${dShpRgEsposterAuea001.name}')}/providers/@{encodeURIComponent('Microsoft.EventGrid')}/@{encodeURIComponent('topics/${dShpEvgtEsposterAuea001.name}/eventSubscriptions/${devEvgsEsposterAuea002.name}')}`,
            queries: {
              "x-ms-api-version": "2025-02-15",
            },
          },
          runAfter: {
            [`Read_${AzureFunction.ProcessPushNotification}_Event_Subscription`]: ["Failed"],
          },
          type: "ApiConnection",
        },
        [`Create_${AzureFunction.ProcessWebhook}_Event_Subscription`]: {
          inputs: {
            body: {
              properties: {
                destination: {
                  endpointType: "AzureFunction",
                  properties: {
                    maxEventsPerBatch: 1,
                    preferredBatchSizeInKilobytes: 64,
                    resourceId: pulumi.interpolate`${dShpFuncEsposterAuea001.id}/functions/${AzureFunction.ProcessWebhook}`,
                  },
                },
                eventDeliverySchema: "EventGridSchema",
                filter: {
                  enableAdvancedFilteringOnArrays: true,
                  includedEventTypes: [AzureFunction.ProcessWebhook],
                  subjectBeginsWith: "",
                  subjectEndsWith: "",
                },
                id: devEvgsEsposterAuea001.id,
                name: devEvgsEsposterAuea001.name,
                resourceGroup: dShpRgEsposterAuea001.name,
                retryPolicy: {
                  eventTimeToLiveInMinutes: 1440,
                  maxDeliveryAttempts: 30,
                },
                topic: dShpEvgtEsposterAuea001.id,
                type: "Microsoft.EventGrid/eventSubscriptions",
              },
            },
            host: {
              connection: {
                name: `@parameters('$connections')['${connectionKey}']['connectionId']`,
              },
            },
            method: "put",
            path: pulumi.interpolate`/subscriptions/@{encodeURIComponent('${AzureSubscriptionId}')}/resourcegroups/@{encodeURIComponent('${dShpRgEsposterAuea001.name}')}/providers/@{encodeURIComponent('Microsoft.EventGrid')}/@{encodeURIComponent('topics/${dShpEvgtEsposterAuea001.name}/eventSubscriptions/${devEvgsEsposterAuea001.name}')}`,
            queries: {
              "x-ms-api-version": "2025-02-15",
            },
          },
          runAfter: {
            [`Read_${AzureFunction.ProcessWebhook}_Event_Subscription`]: ["Failed"],
          },
          type: "ApiConnection",
        },
        [`Read_${AzureFunction.ProcessPushNotification}_Event_Subscription`]: {
          inputs: {
            host: {
              connection: {
                name: `@parameters('$connections')['${connectionKey}']['connectionId']`,
              },
            },
            method: "get",
            path: pulumi.interpolate`/subscriptions/@{encodeURIComponent('${AzureSubscriptionId}')}/resourcegroups/@{encodeURIComponent('${dShpRgEsposterAuea001.name}')}/providers/@{encodeURIComponent('Microsoft.EventGrid')}/@{encodeURIComponent('topics/${dShpEvgtEsposterAuea001.name}/eventSubscriptions/${devEvgsEsposterAuea002.name}')}`,
            queries: {
              "x-ms-api-version": "2025-02-15",
            },
          },
          type: "ApiConnection",
        },
        [`Read_${AzureFunction.ProcessWebhook}_Event_Subscription`]: {
          inputs: {
            host: {
              connection: {
                name: `@parameters('$connections')['${connectionKey}']['connectionId']`,
              },
            },
            method: "get",
            path: pulumi.interpolate`/subscriptions/@{encodeURIComponent('${AzureSubscriptionId}')}/resourcegroups/@{encodeURIComponent('${dShpRgEsposterAuea001.name}')}/providers/@{encodeURIComponent('Microsoft.EventGrid')}/@{encodeURIComponent('topics/${dShpEvgtEsposterAuea001.name}/eventSubscriptions/${devEvgsEsposterAuea001.name}')}`,
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
          [connectionKey]: {
            connectionId: devApicEsposterAuea004.id,
            connectionName: devApicEsposterAuea004.name,
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
    resourceGroupName: dShpRgEsposterAuea001.name,
    state: azure_native.logic.WorkflowState.Enabled,
    tags: {
      ...ApplicationTags,
    },
    workflowName,
  },
  {
    protect: true,
  },
);
