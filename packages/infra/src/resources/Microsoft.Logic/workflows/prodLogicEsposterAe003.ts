import ApplicationTags from "@/constants/ApplicationTags";
import AzureAustraliaEastLocation from "@/constants/AzureAustraliaEastLocation";
import AzureResourceManagerManagedApiId from "@/constants/AzureResourceManagerManagedApiId";
import AzureSubscriptionId from "@/constants/AzureSubscriptionId";
import { prodEvgtEsposterAe001 } from "@/resources/Microsoft.EventGrid/topics/prodEvgtEsposterAe001";
import { prodRgEsposterAe001 } from "@/resources/Microsoft.Resources/resourceGroups/prodRgEsposterAe001";
import { prodApicEsposterAe003 } from "@/resources/Microsoft.Web/connections/prodApicEsposterAe003";
import { AzureFunction } from "@esposter/db-schema";
import * as azure_native from "@pulumi/azure-native";
import * as pulumi from "@pulumi/pulumi";

const workflowName = "prod-logic-esposter-ae-003";

export const prodLogicEsposterAe003: azure_native.logic.Workflow = new azure_native.logic.Workflow(
  workflowName,
  {
    definition: {
      $schema:
        "https://schema.management.azure.com/providers/Microsoft.Logic/schemas/2016-06-01/workflowdefinition.json#",
      actions: {
        [`Delete_${AzureFunction.ProcessPushNotification}_Event_Subscription`]: {
          inputs: {
            host: {
              connection: {
                name: pulumi.interpolate`@parameters('$connections')['${prodApicEsposterAe003.name}']['connectionId']`,
              },
            },
            method: "delete",
            path: pulumi.interpolate`/subscriptions/@{encodeURIComponent('${AzureSubscriptionId}')}/resourcegroups/@{encodeURIComponent('${prodRgEsposterAe001.name}')}/providers/@{encodeURIComponent('Microsoft.EventGrid')}/@{encodeURIComponent('topics/${prodEvgtEsposterAe001.name}/eventSubscriptions/prod-evgs-esposter-ae-002')}`,
            queries: {
              "x-ms-api-version": "2025-02-15",
            },
          },
          type: "ApiConnection",
        },
        [`Delete_${AzureFunction.ProcessWebhook}_Event_Subscription`]: {
          inputs: {
            host: {
              connection: {
                name: pulumi.interpolate`@parameters('$connections')['${prodApicEsposterAe003.name}']['connectionId']`,
              },
            },
            method: "delete",
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
        When_Budget_Action_is_received: {
          inputs: {
            method: "POST",
            schema: {
              properties: {
                data: {
                  properties: {
                    alertContext: {
                      properties: {
                        AlertCategory: {
                          type: "string",
                        },
                        AlertData: {
                          properties: {
                            BudgetCreator: {
                              type: "string",
                            },
                            BudgetId: {
                              type: "string",
                            },
                            BudgetName: {
                              type: "string",
                            },
                            BudgetStartDate: {
                              type: "string",
                            },
                            BudgetThreshold: {
                              type: "string",
                            },
                            BudgetType: {
                              type: "string",
                            },
                            ForecastedTotalForPeriod: {
                              type: "string",
                            },
                            NotificationThresholdAmount: {
                              type: "string",
                            },
                            Scope: {
                              type: "string",
                            },
                            SpentAmount: {
                              type: "string",
                            },
                            ThresholdType: {
                              type: "string",
                            },
                            Unit: {
                              type: "string",
                            },
                          },
                          type: "object",
                        },
                      },
                      type: "object",
                    },
                    essentials: {
                      properties: {
                        alertContextVersion: {
                          type: "string",
                        },
                        alertId: {
                          type: "string",
                        },
                        configurationItems: {
                          items: {
                            type: "string",
                          },
                          type: "array",
                        },
                        description: {
                          type: "string",
                        },
                        essentialsVersion: {
                          type: "string",
                        },
                        firedDateTime: {
                          type: "string",
                        },
                        monitorCondition: {
                          type: "string",
                        },
                        monitoringService: {
                          type: "string",
                        },
                      },
                      type: "object",
                    },
                  },
                  type: "object",
                },
                schemaId: {
                  type: "string",
                },
              },
              type: "object",
            },
          },
          kind: "Http",
          operationOptions: "EnableSchemaValidation",
          type: "Request",
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
    parameters: pulumi
      .all([prodApicEsposterAe003.name, prodApicEsposterAe003.id])
      .apply(([connectionName, connectionId]) => ({
        $connections: {
          value: {
            [connectionName]: {
              connectionId,
              connectionName,
              connectionProperties: {
                authentication: {
                  type: "ManagedServiceIdentity",
                },
              },
              id: AzureResourceManagerManagedApiId,
            },
          },
        },
      })),
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
