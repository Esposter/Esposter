import AzureSubscriptionId from "@/constants/AzureSubscriptionId";
import { prodAgEsposter001InProdRg } from "@/resources/Microsoft.Insights/actionGroups/prodAgEsposter001InProdRg";
import { prodAgEsposter003InProdRg } from "@/resources/Microsoft.Insights/actionGroups/prodAgEsposter003InProdRg";
import { pShpRgEsposterAuea001 } from "@/resources/Microsoft.Resources/resourceGroups/pShpRgEsposterAuea001";
import { pShpFuncEsposterAuea001 } from "@/resources/Microsoft.Web/sites/pShpFuncEsposterAuea001";
import * as azure_native from "@pulumi/azure-native";
import * as pulumi from "@pulumi/pulumi";

const budgetName = "prod-bgt-esposter-001";

export const prodBgtEsposter001: azure_native.consumption.Budget = new azure_native.consumption.Budget(
  budgetName,
  {
    amount: 0.01,
    budgetName,
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
        contactGroups: [prodAgEsposter003InProdRg.id],
        enabled: true,
        operator: "GreaterThanOrEqualTo",
        threshold: 100,
        thresholdType: "Actual",
      },
      ActualCost_100_StopFunction: {
        contactEmails: [],
        contactGroups: [prodAgEsposter001InProdRg.id],
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
      startDate: "2026-05-01T00:00:00Z",
    },
  },
  {
    protect: true,
  },
);
