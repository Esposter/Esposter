import * as azure_native from "@pulumi/azure-native";

export const pShpBdgEsposterAuea002: azure_native.consumption.Budget = new azure_native.consumption.Budget(
  "p-shp-bdg-esposter-auea-002",
  {
    amount: 0.01,
    budgetName: "p-shp-bdg-esposter-auea-002",
    category: azure_native.consumption.CategoryType.Cost,
    eTag: '"1dc4df93fe57c03"',
    filter: {
      dimensions: {
        name: "ResourceId",
        operator: azure_native.consumption.BudgetOperatorType.In,
        values: [
          "/subscriptions/764658ba-01da-43fa-9f26-ffa4ada33ebb/resourcegroups/p-shp-rg-esposter-auea-001/providers/microsoft.eventgrid/topics/p-shp-evgt-esposter-auea-001",
        ],
      },
    },
    notifications: {},
    scope: "subscriptions/764658ba-01da-43fa-9f26-ffa4ada33ebb/resourceGroups/p-shp-rg-esposter-auea-001",
    timeGrain: azure_native.consumption.TimeGrainType.Monthly,
    timePeriod: {
      endDate: "2035-12-31T00:00:00Z",
      startDate: "2025-11-01T00:00:00Z",
    },
  },
  {
    protect: true,
  },
);
