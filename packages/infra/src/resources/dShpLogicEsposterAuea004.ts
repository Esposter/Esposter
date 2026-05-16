import * as azure_native from "@pulumi/azure-native";

export const dShpLogicEsposterAuea004: azure_native.logic.Workflow = new azure_native.logic.Workflow(
  "d-shp-logic-esposter-auea-004",
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
                    resourceId:
                      "/subscriptions/764658ba-01da-43fa-9f26-ffa4ada33ebb/resourceGroups/d-shp-rg-esposter-auea-001/providers/Microsoft.Web/sites/d-shp-func-esposter-auea-001/functions/ProcessPushNotification",
                  },
                },
                eventDeliverySchema: "EventGridSchema",
                filter: {
                  enableAdvancedFilteringOnArrays: true,
                  includedEventTypes: ["ProcessPushNotification"],
                  subjectBeginsWith: "",
                  subjectEndsWith: "",
                },
                id: "/subscriptions/764658ba-01da-43fa-9f26-ffa4ada33ebb/resourceGroups/d-shp-rg-esposter-auea-001/providers/Microsoft.EventGrid/topics/d-shp-evgt-esposter-auea-001/providers/Microsoft.EventGrid/eventSubscriptions/d-shp-evgts-esposter-auea-002",
                name: "d-shp-evgts-esposter-auea-002",
                resourceGroup: "d-shp-rg-esposter-auea-001",
                retryPolicy: {
                  eventTimeToLiveInMinutes: 1440,
                  maxDeliveryAttempts: 30,
                },
                topic:
                  "/subscriptions/764658ba-01da-43fa-9f26-ffa4ada33ebb/resourceGroups/d-shp-rg-esposter-auea-001/providers/Microsoft.EventGrid/topics/d-shp-evgt-esposter-auea-001",
                type: "Microsoft.EventGrid/eventSubscriptions",
              },
            },
            host: {
              connection: {
                name: "@parameters('$connections')['arm']['connectionId']",
              },
            },
            method: "put",
            path: "/subscriptions/@{encodeURIComponent('764658ba-01da-43fa-9f26-ffa4ada33ebb')}/resourcegroups/@{encodeURIComponent('d-shp-rg-esposter-auea-001')}/providers/@{encodeURIComponent('Microsoft.EventGrid')}/@{encodeURIComponent('topics/d-shp-evgt-esposter-auea-001/eventSubscriptions/d-shp-evgts-esposter-auea-002')}",
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
                    resourceId:
                      "/subscriptions/764658ba-01da-43fa-9f26-ffa4ada33ebb/resourceGroups/d-shp-rg-esposter-auea-001/providers/Microsoft.Web/sites/d-shp-func-esposter-auea-001/functions/ProcessWebhook",
                  },
                },
                eventDeliverySchema: "EventGridSchema",
                filter: {
                  enableAdvancedFilteringOnArrays: true,
                  includedEventTypes: ["ProcessWebhook"],
                  subjectBeginsWith: "",
                  subjectEndsWith: "",
                },
                id: "/subscriptions/764658ba-01da-43fa-9f26-ffa4ada33ebb/resourceGroups/d-shp-rg-esposter-auea-001/providers/Microsoft.EventGrid/topics/d-shp-evgt-esposter-auea-001/providers/Microsoft.EventGrid/eventSubscriptions/d-shp-evgts-esposter-auea-001",
                name: "d-shp-evgts-esposter-auea-001",
                resourceGroup: "d-shp-rg-esposter-auea-001",
                retryPolicy: {
                  eventTimeToLiveInMinutes: 1440,
                  maxDeliveryAttempts: 30,
                },
                topic:
                  "/subscriptions/764658ba-01da-43fa-9f26-ffa4ada33ebb/resourceGroups/d-shp-rg-esposter-auea-001/providers/Microsoft.EventGrid/topics/d-shp-evgt-esposter-auea-001",
                type: "Microsoft.EventGrid/eventSubscriptions",
              },
            },
            host: {
              connection: {
                name: "@parameters('$connections')['arm']['connectionId']",
              },
            },
            method: "put",
            path: "/subscriptions/@{encodeURIComponent('764658ba-01da-43fa-9f26-ffa4ada33ebb')}/resourcegroups/@{encodeURIComponent('d-shp-rg-esposter-auea-001')}/providers/@{encodeURIComponent('Microsoft.EventGrid')}/@{encodeURIComponent('topics/d-shp-evgt-esposter-auea-001/eventSubscriptions/d-shp-evgts-esposter-auea-001')}",
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
                name: "@parameters('$connections')['arm']['connectionId']",
              },
            },
            method: "get",
            path: "/subscriptions/@{encodeURIComponent('764658ba-01da-43fa-9f26-ffa4ada33ebb')}/resourcegroups/@{encodeURIComponent('d-shp-rg-esposter-auea-001')}/providers/@{encodeURIComponent('Microsoft.EventGrid')}/@{encodeURIComponent('topics/d-shp-evgt-esposter-auea-001/eventSubscriptions/d-shp-evgts-esposter-auea-002')}",
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
                name: "@parameters('$connections')['arm']['connectionId']",
              },
            },
            method: "get",
            path: "/subscriptions/@{encodeURIComponent('764658ba-01da-43fa-9f26-ffa4ada33ebb')}/resourcegroups/@{encodeURIComponent('d-shp-rg-esposter-auea-001')}/providers/@{encodeURIComponent('Microsoft.EventGrid')}/@{encodeURIComponent('topics/d-shp-evgt-esposter-auea-001/eventSubscriptions/d-shp-evgts-esposter-auea-001')}",
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
    location: "australiaeast",
    parameters: {},
    resourceGroupName: "d-shp-rg-esposter-auea-001",
    state: azure_native.logic.WorkflowState.Enabled,
    tags: {
      Application: "Esposter",
    },
    workflowName: "d-shp-logic-esposter-auea-004",
  },
  {
    protect: true,
  },
);
