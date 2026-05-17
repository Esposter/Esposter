import * as azure_native from "@pulumi/azure-native";
import { dShpApicnEsposterAuea001 } from "../../Microsoft.Web/connections/dShpApicnEsposterAuea001";

export const dShpLogicEsposterAuea001: azure_native.logic.Workflow = new azure_native.logic.Workflow(
  "d-shp-logic-esposter-auea-001",
  {
    definition: {
      $schema:
        "https://schema.management.azure.com/providers/Microsoft.Logic/schemas/2016-06-01/workflowdefinition.json#",
      actions: {
        Stop_Function_App: {
          inputs: {
            host: {
              connection: {
                name: "@parameters('$connections')['azureappservice-1']['connectionId']",
              },
            },
            method: "post",
            path: "/subscriptions/@{encodeURIComponent('764658ba-01da-43fa-9f26-ffa4ada33ebb')}/resourcegroups/@{encodeURIComponent('d-shp-rg-esposter-auea-001')}/providers/Microsoft.Web/sites/@{encodeURIComponent('d-shp-func-esposter-auea-001')}/stop",
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
    parameters: {
      $connections: {
        value: {
          "azureappservice-1": {
            connectionId: dShpApicnEsposterAuea001.id,
            connectionName: "azureappservice-1",
            id: "/subscriptions/764658ba-01da-43fa-9f26-ffa4ada33ebb/providers/Microsoft.Web/locations/australiaeast/managedApis/azureappservice",
          },
        },
      },
    },
    resourceGroupName: "d-shp-rg-esposter-auea-001",
    state: azure_native.logic.WorkflowState.Enabled,
    tags: {
      Application: "Esposter",
    },
    workflowName: "d-shp-logic-esposter-auea-001",
  },
  {
    protect: true,
  },
);
