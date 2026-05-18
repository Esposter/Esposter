import AzureSubscriptionId from "@/constants/AzureSubscriptionId";
import { pShpAgEsposterAuea001 } from "@/resources/Microsoft.Insights/actionGroups/pShpAgEsposterAuea001";
import { pShpAgEsposterAuea003 } from "@/resources/Microsoft.Insights/actionGroups/pShpAgEsposterAuea003";
import { pShpRgEsposterAuea001 } from "@/resources/Microsoft.Resources/resourceGroups/pShpRgEsposterAuea001";
import { pShpFuncEsposterAuea001 } from "@/resources/Microsoft.Web/sites/pShpFuncEsposterAuea001";
import * as azure_native from "@pulumi/azure-native";
import * as pulumi from "@pulumi/pulumi";

export const pShpBdgEsposterAuea001: azure_native.consumption.Budget = new azure_native.consumption.Budget(
  "p-shp-bdg-esposter-auea-001",
  {
    amount: 0.01,
    budgetName: "p-shp-bdg-esposter-auea-001",
    category: azure_native.consumption.CategoryType.Cost,
    filter: {
      dimensions: {
        name: "ResourceId",
        operator: azure_native.consumption.BudgetOperatorType.In,
        values: [pShpFuncEsposterAuea001.id],
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
    scope: pulumi.interpolate`subscriptions/${AzureSubscriptionId}/resourceGroups/${pShpRgEsposterAuea001.name}`,
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
