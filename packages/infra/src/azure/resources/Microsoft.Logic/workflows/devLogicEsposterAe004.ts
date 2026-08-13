import ApplicationTags from "@/azure/constants/ApplicationTags";
import AzureAustraliaEastLocation from "@/azure/constants/AzureAustraliaEastLocation";
import AzureEventSubscriptionRetryPolicy from "@/azure/constants/AzureEventSubscriptionRetryPolicy";
import AzureLogicAppEndpointsConfiguration from "@/azure/constants/AzureLogicAppEndpointsConfiguration";
import AzureResourceManagerManagedApiId from "@/azure/constants/AzureResourceManagerManagedApiId";
import AzureSubscriptionId from "@/azure/constants/AzureSubscriptionId";
import { devEvgtEsposterAe001 } from "@/azure/resources/Microsoft.EventGrid/topics/devEvgtEsposterAe001";
import { devRgEsposterAe001 } from "@/azure/resources/Microsoft.Resources/resourceGroups/devRgEsposterAe001";
import { devstesposter001Deadletter } from "@/azure/resources/Microsoft.Storage/storageAccounts/blobContainers/devstesposter001Deadletter";
import { devstesposter001 } from "@/azure/resources/Microsoft.Storage/storageAccounts/devstesposter001";
import { devApicEsposterAe004 } from "@/azure/resources/Microsoft.Web/connections/devApicEsposterAe004";
import { devFuncEsposter001 } from "@/azure/resources/Microsoft.Web/sites/devFuncEsposter001";
import { getWorkflowConnectionParameters } from "@/azure/services/getWorkflowConnectionParameters";
import { AzureFunction } from "@esposter/db-schema";
import * as azure_native from "@pulumi/azure-native";
import * as pulumi from "@pulumi/pulumi";

const workflowName = "dev-logic-esposter-ae-004";

export const devLogicEsposterAe004: azure_native.logic.Workflow = new azure_native.logic.Workflow(
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
                // Mirrors the Pulumi subscription: a subscription recreated without this simply drops every event
                // Whose delivery runs out of attempts, and the replay pipeline is inert for it
                deadLetterDestination: {
                  endpointType: "StorageBlob",
                  properties: {
                    blobContainerName: devstesposter001Deadletter.name,
                    resourceId: devstesposter001.id,
                  },
                },
                destination: {
                  endpointType: "AzureFunction",
                  properties: {
                    maxEventsPerBatch: 1,
                    preferredBatchSizeInKilobytes: 64,
                    resourceId: pulumi.interpolate`${devFuncEsposter001.id}/functions/${AzureFunction.ProcessPushNotification}`,
                  },
                },
                eventDeliverySchema: "EventGridSchema",
                filter: {
                  enableAdvancedFilteringOnArrays: true,
                  includedEventTypes: [AzureFunction.ProcessPushNotification],
                  subjectBeginsWith: "",
                  subjectEndsWith: "",
                },
                id: pulumi.interpolate`/subscriptions/${AzureSubscriptionId}/resourceGroups/${devRgEsposterAe001.name}/providers/Microsoft.EventGrid/topics/${devEvgtEsposterAe001.name}/providers/Microsoft.EventGrid/eventSubscriptions/dev-evgs-esposter-ae-002`,
                name: "dev-evgs-esposter-ae-002",
                resourceGroup: devRgEsposterAe001.name,
                retryPolicy: AzureEventSubscriptionRetryPolicy,
                topic: devEvgtEsposterAe001.id,
                type: "Microsoft.EventGrid/eventSubscriptions",
              },
            },
            host: {
              connection: {
                name: pulumi.interpolate`@parameters('$connections')['${devApicEsposterAe004.name}']['connectionId']`,
              },
            },
            method: "put",
            path: pulumi.interpolate`/subscriptions/@{encodeURIComponent('${AzureSubscriptionId}')}/resourcegroups/@{encodeURIComponent('${devRgEsposterAe001.name}')}/providers/@{encodeURIComponent('Microsoft.EventGrid')}/@{encodeURIComponent('topics/${devEvgtEsposterAe001.name}/eventSubscriptions/dev-evgs-esposter-ae-002')}`,
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
                // Mirrors the Pulumi subscription: a subscription recreated without this simply drops every event
                // Whose delivery runs out of attempts, and the replay pipeline is inert for it
                deadLetterDestination: {
                  endpointType: "StorageBlob",
                  properties: {
                    blobContainerName: devstesposter001Deadletter.name,
                    resourceId: devstesposter001.id,
                  },
                },
                destination: {
                  endpointType: "AzureFunction",
                  properties: {
                    maxEventsPerBatch: 1,
                    preferredBatchSizeInKilobytes: 64,
                    resourceId: pulumi.interpolate`${devFuncEsposter001.id}/functions/${AzureFunction.ProcessWebhook}`,
                  },
                },
                eventDeliverySchema: "EventGridSchema",
                filter: {
                  enableAdvancedFilteringOnArrays: true,
                  includedEventTypes: [AzureFunction.ProcessWebhook],
                  subjectBeginsWith: "",
                  subjectEndsWith: "",
                },
                id: pulumi.interpolate`/subscriptions/${AzureSubscriptionId}/resourceGroups/${devRgEsposterAe001.name}/providers/Microsoft.EventGrid/topics/${devEvgtEsposterAe001.name}/providers/Microsoft.EventGrid/eventSubscriptions/dev-evgs-esposter-ae-001`,
                name: "dev-evgs-esposter-ae-001",
                resourceGroup: devRgEsposterAe001.name,
                retryPolicy: AzureEventSubscriptionRetryPolicy,
                topic: devEvgtEsposterAe001.id,
                type: "Microsoft.EventGrid/eventSubscriptions",
              },
            },
            host: {
              connection: {
                name: pulumi.interpolate`@parameters('$connections')['${devApicEsposterAe004.name}']['connectionId']`,
              },
            },
            method: "put",
            path: pulumi.interpolate`/subscriptions/@{encodeURIComponent('${AzureSubscriptionId}')}/resourcegroups/@{encodeURIComponent('${devRgEsposterAe001.name}')}/providers/@{encodeURIComponent('Microsoft.EventGrid')}/@{encodeURIComponent('topics/${devEvgtEsposterAe001.name}/eventSubscriptions/dev-evgs-esposter-ae-001')}`,
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
                name: pulumi.interpolate`@parameters('$connections')['${devApicEsposterAe004.name}']['connectionId']`,
              },
            },
            method: "get",
            path: pulumi.interpolate`/subscriptions/@{encodeURIComponent('${AzureSubscriptionId}')}/resourcegroups/@{encodeURIComponent('${devRgEsposterAe001.name}')}/providers/@{encodeURIComponent('Microsoft.EventGrid')}/@{encodeURIComponent('topics/${devEvgtEsposterAe001.name}/eventSubscriptions/dev-evgs-esposter-ae-002')}`,
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
                name: pulumi.interpolate`@parameters('$connections')['${devApicEsposterAe004.name}']['connectionId']`,
              },
            },
            method: "get",
            path: pulumi.interpolate`/subscriptions/@{encodeURIComponent('${AzureSubscriptionId}')}/resourcegroups/@{encodeURIComponent('${devRgEsposterAe001.name}')}/providers/@{encodeURIComponent('Microsoft.EventGrid')}/@{encodeURIComponent('topics/${devEvgtEsposterAe001.name}/eventSubscriptions/dev-evgs-esposter-ae-001')}`,
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
