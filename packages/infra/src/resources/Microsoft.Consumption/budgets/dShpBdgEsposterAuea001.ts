import * as azure_native from "@pulumi/azure-native";

import { dShpAgEsposterAuea001 } from "../../Microsoft.Insights/actionGroups/dShpAgEsposterAuea001";
import { dShpAgEsposterAuea003 } from "../../Microsoft.Insights/actionGroups/dShpAgEsposterAuea003";

export const dShpBdgEsposterAuea001: azure_native.consumption.Budget = new azure_native.consumption.Budget(
  "d-shp-bdg-esposter-auea-001",
  {
    amount: 0.01,
    budgetName: "d-shp-bdg-esposter-auea-001",
    category: azure_native.consumption.CategoryType.Cost,
    filter: {
      dimensions: {
        name: "ResourceId",
        operator: azure_native.consumption.BudgetOperatorType.In,
        values: [
          "/subscriptions/764658ba-01da-43fa-9f26-ffa4ada33ebb/resourcegroups/d-shp-rg-esposter-auea-001/providers/microsoft.web/sites/d-shp-func-esposter-auea-001",
        ],
      },
    },
    notifications: {
      ActualCost_100_DeleteSub: {
        contactEmails: [],
        contactGroups: [dShpAgEsposterAuea003.id],
        enabled: true,
        operator: "GreaterThanOrEqualTo",
        threshold: 100,
        thresholdType: "Actual",
      },
      ActualCost_100_StopFunction: {
        contactEmails: [],
        contactGroups: [dShpAgEsposterAuea001.id],
        enabled: true,
        operator: "GreaterThanOrEqualTo",
        threshold: 100,
        thresholdType: "Actual",
      },
    },
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
