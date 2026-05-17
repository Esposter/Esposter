import * as azure_native from "@pulumi/azure-native";

import { pShpAgEsposterAuea001 } from "../../Microsoft.Insights/actionGroups/pShpAgEsposterAuea001";
import { pShpAgEsposterAuea003 } from "../../Microsoft.Insights/actionGroups/pShpAgEsposterAuea003";

export const pShpBdgEsposterAuea002: azure_native.consumption.Budget = new azure_native.consumption.Budget(
  "p-shp-bdg-esposter-auea-002",
  {
    amount: 0.01,
    budgetName: "p-shp-bdg-esposter-auea-002",
    category: azure_native.consumption.CategoryType.Cost,
    filter: {
      dimensions: {
        name: "ResourceId",
        operator: azure_native.consumption.BudgetOperatorType.In,
        values: [
          "/subscriptions/764658ba-01da-43fa-9f26-ffa4ada33ebb/resourcegroups/p-shp-rg-esposter-auea-001/providers/microsoft.eventgrid/topics/p-shp-evgt-esposter-auea-001",
        ],
      },
    },
    notifications: {
      ActualCost_100_DeleteSub: {
        contactEmails: [],
        contactGroups: [pShpAgEsposterAuea003.id],
        enabled: true,
        operator: "GreaterThanOrEqualTo",
        threshold: 100,
        thresholdType: "Actual",
      },
      ActualCost_100_StopFunction: {
        contactEmails: [],
        contactGroups: [pShpAgEsposterAuea001.id],
        enabled: true,
        operator: "GreaterThanOrEqualTo",
        threshold: 100,
        thresholdType: "Actual",
      },
    },
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
