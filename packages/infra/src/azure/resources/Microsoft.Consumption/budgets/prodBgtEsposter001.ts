import AzureSubscriptionId from "@/azure/constants/AzureSubscriptionId";
import { prodAgEsposter001 } from "@/azure/resources/Microsoft.Insights/actionGroups/prodAgEsposter001";
import { prodAgEsposter003 } from "@/azure/resources/Microsoft.Insights/actionGroups/prodAgEsposter003";
import { prodRgEsposterAe001 } from "@/azure/resources/Microsoft.Resources/resourceGroups/prodRgEsposterAe001";
import { prodFuncEsposter001 } from "@/azure/resources/Microsoft.Web/sites/prodFuncEsposter001";
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
        values: [prodFuncEsposter001.id],
      },
    },
    notifications: {
      ActualCost_100_DeleteSub: {
        contactEmails: [],
        contactGroups: [prodAgEsposter003.id],
        enabled: true,
        operator: "GreaterThanOrEqualTo",
        threshold: 100,
        thresholdType: "Actual",
      },
      ActualCost_100_StopFunction: {
        contactEmails: [],
        contactGroups: [prodAgEsposter001.id],
        enabled: true,
        operator: "GreaterThanOrEqualTo",
        threshold: 100,
        thresholdType: "Actual",
      },
    },
    scope: pulumi.interpolate`subscriptions/${AzureSubscriptionId}/resourceGroups/${prodRgEsposterAe001.name}`,
    timeGrain: azure_native.consumption.TimeGrainType.Monthly,
    timePeriod: {
      endDate: "2035-12-31T00:00:00Z",
      startDate: "2026-05-01T00:00:00Z",
    },
  },
  { protect: true },
);
