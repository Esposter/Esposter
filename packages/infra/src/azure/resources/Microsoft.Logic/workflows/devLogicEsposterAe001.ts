import ApplicationTags from "#src/azure/constants/ApplicationTags";
import AzureAppServiceManagedApiId from "#src/azure/constants/AzureAppServiceManagedApiId";
import AzureAustraliaEastLocation from "#src/azure/constants/AzureAustraliaEastLocation";
import AzureLogicAppEndpointsConfiguration from "#src/azure/constants/AzureLogicAppEndpointsConfiguration";
import AzureSubscriptionId from "#src/azure/constants/AzureSubscriptionId";
import { devRgEsposterAe001 } from "#src/azure/resources/Microsoft.Resources/resourceGroups/devRgEsposterAe001";
import { devApicEsposterAe001 } from "#src/azure/resources/Microsoft.Web/connections/devApicEsposterAe001";
import { devFuncEsposter001 } from "#src/azure/resources/Microsoft.Web/sites/devFuncEsposter001";
import { getWorkflowConnectionParameters } from "#src/azure/services/getWorkflowConnectionParameters";
import * as azure_native from "@pulumi/azure-native";
import * as pulumi from "@pulumi/pulumi";

const workflowName = "dev-logic-esposter-ae-001";

export const devLogicEsposterAe001: azure_native.logic.Workflow = new azure_native.logic.Workflow(
  workflowName,
  {
    definition: {
      $schema:
        "https://schema.management.azure.com/providers/Microsoft.Logic/schemas/2016-06-01/workflowdefinition.json#",
      actions: {
        Stop_Function_App: {
          inputs: {
            host: {
              connection: {
                name: pulumi.interpolate`@parameters('$connections')['${devApicEsposterAe001.name}']['connectionId']`,
              },
            },
            method: "post",
            path: pulumi.interpolate`/subscriptions/@{encodeURIComponent('${AzureSubscriptionId}')}/resourcegroups/@{encodeURIComponent('${devRgEsposterAe001.name}')}/providers/Microsoft.Web/sites/@{encodeURIComponent('${devFuncEsposter001.name}')}/stop`,
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
      staticResults: {
        Stop_web_app0: {
          hasDelegate: false,
          status: "Succeeded",
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
