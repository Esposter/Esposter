import * as azure_native from "@pulumi/azure-native";

export const dShpBdgEsposterAuea002: azure_native.consumption.Budget = new azure_native.consumption.Budget(
  "d-shp-bdg-esposter-auea-002",
  {
    amount: 0.01,
    budgetName: "d-shp-bdg-esposter-auea-002",
    category: azure_native.consumption.CategoryType.Cost,
    eTag: '"1dc4d69b69fbfd0"',
    notifications: {},
    scope: "subscriptions/764658ba-01da-43fa-9f26-ffa4ada33ebb/resourceGroups/d-shp-rg-esposter-auea-001",
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
