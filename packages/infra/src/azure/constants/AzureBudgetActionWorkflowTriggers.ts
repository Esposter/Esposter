// The budget-alert webhook every guard workflow is started by. Azure Cost Management posts the same envelope
// Whatever the budget watches, so the trigger is the shape of that payload rather than anything a stack owns.
const AzureBudgetActionWorkflowTriggers: Record<string, unknown> = {
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
};

export default AzureBudgetActionWorkflowTriggers;
