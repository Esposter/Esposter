import * as azure_native from "@pulumi/azure-native";

export const dShpBdgEsposterAuea001: azure_native.consumption.Budget = new azure_native.consumption.Budget(
  "d-shp-bdg-esposter-auea-001",
  {
    amount: 0.01,
    budgetName: "d-shp-bdg-esposter-auea-001",
    category: azure_native.consumption.CategoryType.Cost,
    eTag: '"1dc3f6340d6f2d0"',
    filter: {
      dimensions: {
        name: "ResourceId",
        operator: azure_native.consumption.BudgetOperatorType.In,
        values: [
          "/subscriptions/764658ba-01da-43fa-9f26-ffa4ada33ebb/resourcegroups/d-shp-rg-esposter-auea-001/providers/microsoft.web/sites/d-shp-func-esposter-auea-001",
        ],
      },
    },
    notifications: {},
    scope: "subscriptions/764658ba-01da-43fa-9f26-ffa4ada33ebb/resourceGroups/d-shp-rg-esposter-auea-001",
    timeGrain: azure_native.consumption.TimeGrainType.Monthly,
    timePeriod: {
      endDate: "2035-12-31T00:00:00Z",
      startDate: "2025-10-01T00:00:00Z",
    },
  },
  {
    protect: true,
  },
);
