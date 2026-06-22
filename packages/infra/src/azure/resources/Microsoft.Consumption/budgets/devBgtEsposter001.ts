import AzureSubscriptionId from "@/azure/constants/AzureSubscriptionId";
import { devAgEsposter001 } from "@/azure/resources/Microsoft.Insights/actionGroups/devAgEsposter001";
import { devAgEsposter003 } from "@/azure/resources/Microsoft.Insights/actionGroups/devAgEsposter003";
import { devRgEsposterAe001 } from "@/azure/resources/Microsoft.Resources/resourceGroups/devRgEsposterAe001";
import { devFuncEsposter001 } from "@/azure/resources/Microsoft.Web/sites/devFuncEsposter001";
import * as azure_native from "@pulumi/azure-native";
import * as pulumi from "@pulumi/pulumi";

const budgetName = "dev-bgt-esposter-001";

export const devBgtEsposter001: azure_native.consumption.Budget = new azure_native.consumption.Budget(
  budgetName,
  {
    amount: 0.01,
    budgetName,
    category: azure_native.consumption.CategoryType.Cost,
    filter: {
      dimensions: {
        name: "ResourceId",
        operator: azure_native.consumption.BudgetOperatorType.In,
        values: [devFuncEsposter001.id],
      },
    },
    notifications: {
      ActualCost_100_DeleteSub: {
        contactEmails: [],
        contactGroups: [devAgEsposter003.id],
        enabled: true,
        operator: "GreaterThanOrEqualTo",
        threshold: 100,
        thresholdType: "Actual",
      },
      ActualCost_100_StopFunction: {
        contactEmails: [],
        contactGroups: [devAgEsposter001.id],
        enabled: true,
        operator: "GreaterThanOrEqualTo",
        threshold: 100,
        thresholdType: "Actual",
      },
    },
    scope: pulumi.interpolate`subscriptions/${AzureSubscriptionId}/resourceGroups/${devRgEsposterAe001.name}`,
    timeGrain: azure_native.consumption.TimeGrainType.Monthly,
    timePeriod: {
      endDate: "2035-12-31T00:00:00Z",
      startDate: "2026-05-01T00:00:00Z",
    },
  },
  { protect: true },
);
