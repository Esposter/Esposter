import ApplicationTags from "@/azure/constants/ApplicationTags";
import AzureAustraliaEastLocation from "@/azure/constants/AzureAustraliaEastLocation";
import AzureEventSubscriptionRetryPolicy from "@/azure/constants/AzureEventSubscriptionRetryPolicy";
import AzureLogicAppEndpointsConfiguration from "@/azure/constants/AzureLogicAppEndpointsConfiguration";
import AzureResourceManagerManagedApiId from "@/azure/constants/AzureResourceManagerManagedApiId";
import AzureSubscriptionId from "@/azure/constants/AzureSubscriptionId";
import { prodEvgtEsposterAe001 } from "@/azure/resources/Microsoft.EventGrid/topics/prodEvgtEsposterAe001";
import { prodRgEsposterAe001 } from "@/azure/resources/Microsoft.Resources/resourceGroups/prodRgEsposterAe001";
import { prodstesposter001Deadletter } from "@/azure/resources/Microsoft.Storage/storageAccounts/blobContainers/prodstesposter001Deadletter";
import { prodstesposter001 } from "@/azure/resources/Microsoft.Storage/storageAccounts/prodstesposter001";
import { prodApicEsposterAe004 } from "@/azure/resources/Microsoft.Web/connections/prodApicEsposterAe004";
import { prodFuncEsposter001 } from "@/azure/resources/Microsoft.Web/sites/prodFuncEsposter001";
import { getWorkflowConnectionParameters } from "@/azure/services/getWorkflowConnectionParameters";
import { AzureFunction } from "@esposter/db-schema";
import * as azure_native from "@pulumi/azure-native";
import * as pulumi from "@pulumi/pulumi";

const workflowName = "prod-logic-esposter-ae-004";

export const prodLogicEsposterAe004: azure_native.logic.Workflow = new azure_native.logic.Workflow(
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
                    blobContainerName: prodstesposter001Deadletter.name,
                    resourceId: prodstesposter001.id,
                  },
                },
                destination: {
                  endpointType: "AzureFunction",
                  properties: {
                    maxEventsPerBatch: 1,
                    preferredBatchSizeInKilobytes: 64,
                    resourceId: pulumi.interpolate`${prodFuncEsposter001.id}/functions/${AzureFunction.ProcessPushNotification}`,
                  },
                },
                eventDeliverySchema: "EventGridSchema",
                filter: {
                  enableAdvancedFilteringOnArrays: true,
                  includedEventTypes: [AzureFunction.ProcessPushNotification],
                  subjectBeginsWith: "",
                  subjectEndsWith: "",
                },
                id: pulumi.interpolate`/subscriptions/${AzureSubscriptionId}/resourceGroups/${prodRgEsposterAe001.name}/providers/Microsoft.EventGrid/topics/${prodEvgtEsposterAe001.name}/providers/Microsoft.EventGrid/eventSubscriptions/prod-evgs-esposter-ae-002`,
                name: "prod-evgs-esposter-ae-002",
                resourceGroup: prodRgEsposterAe001.name,
                retryPolicy: AzureEventSubscriptionRetryPolicy,
                topic: prodEvgtEsposterAe001.id,
                type: "Microsoft.EventGrid/eventSubscriptions",
              },
            },
            host: {
              connection: {
                name: pulumi.interpolate`@parameters('$connections')['${prodApicEsposterAe004.name}']['connectionId']`,
              },
            },
            method: "put",
            path: pulumi.interpolate`/subscriptions/@{encodeURIComponent('${AzureSubscriptionId}')}/resourcegroups/@{encodeURIComponent('${prodRgEsposterAe001.name}')}/providers/@{encodeURIComponent('Microsoft.EventGrid')}/@{encodeURIComponent('topics/${prodEvgtEsposterAe001.name}/eventSubscriptions/prod-evgs-esposter-ae-002')}`,
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
                    blobContainerName: prodstesposter001Deadletter.name,
                    resourceId: prodstesposter001.id,
                  },
                },
                destination: {
                  endpointType: "AzureFunction",
                  properties: {
                    maxEventsPerBatch: 1,
                    preferredBatchSizeInKilobytes: 64,
                    resourceId: pulumi.interpolate`${prodFuncEsposter001.id}/functions/${AzureFunction.ProcessWebhook}`,
                  },
                },
                eventDeliverySchema: "EventGridSchema",
                filter: {
                  enableAdvancedFilteringOnArrays: true,
                  includedEventTypes: [AzureFunction.ProcessWebhook],
                  subjectBeginsWith: "",
                  subjectEndsWith: "",
                },
                id: pulumi.interpolate`/subscriptions/${AzureSubscriptionId}/resourceGroups/${prodRgEsposterAe001.name}/providers/Microsoft.EventGrid/topics/${prodEvgtEsposterAe001.name}/providers/Microsoft.EventGrid/eventSubscriptions/prod-evgs-esposter-ae-001`,
                name: "prod-evgs-esposter-ae-001",
                resourceGroup: prodRgEsposterAe001.name,
                retryPolicy: AzureEventSubscriptionRetryPolicy,
                topic: prodEvgtEsposterAe001.id,
                type: "Microsoft.EventGrid/eventSubscriptions",
              },
            },
            host: {
              connection: {
                name: pulumi.interpolate`@parameters('$connections')['${prodApicEsposterAe004.name}']['connectionId']`,
              },
            },
            method: "put",
            path: pulumi.interpolate`/subscriptions/@{encodeURIComponent('${AzureSubscriptionId}')}/resourcegroups/@{encodeURIComponent('${prodRgEsposterAe001.name}')}/providers/@{encodeURIComponent('Microsoft.EventGrid')}/@{encodeURIComponent('topics/${prodEvgtEsposterAe001.name}/eventSubscriptions/prod-evgs-esposter-ae-001')}`,
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
                name: pulumi.interpolate`@parameters('$connections')['${prodApicEsposterAe004.name}']['connectionId']`,
              },
            },
            method: "get",
            path: pulumi.interpolate`/subscriptions/@{encodeURIComponent('${AzureSubscriptionId}')}/resourcegroups/@{encodeURIComponent('${prodRgEsposterAe001.name}')}/providers/@{encodeURIComponent('Microsoft.EventGrid')}/@{encodeURIComponent('topics/${prodEvgtEsposterAe001.name}/eventSubscriptions/prod-evgs-esposter-ae-002')}`,
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
                name: pulumi.interpolate`@parameters('$connections')['${prodApicEsposterAe004.name}']['connectionId']`,
              },
            },
            method: "get",
            path: pulumi.interpolate`/subscriptions/@{encodeURIComponent('${AzureSubscriptionId}')}/resourcegroups/@{encodeURIComponent('${prodRgEsposterAe001.name}')}/providers/@{encodeURIComponent('Microsoft.EventGrid')}/@{encodeURIComponent('topics/${prodEvgtEsposterAe001.name}/eventSubscriptions/prod-evgs-esposter-ae-001')}`,
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
