import AzureSubscriptionId from "@/constants/AzureSubscriptionId";
import { devAgEsposter001InDevRg } from "@/resources/Microsoft.Insights/actionGroups/devAgEsposter001InDevRg";
import { devAgEsposter003InDevRg } from "@/resources/Microsoft.Insights/actionGroups/devAgEsposter003InDevRg";
import { dShpRgEsposterAuea001 } from "@/resources/Microsoft.Resources/resourceGroups/dShpRgEsposterAuea001";
import * as azure_native from "@pulumi/azure-native";
import * as pulumi from "@pulumi/pulumi";

const budgetName = "dev-bgt-esposter-002";

export const devBgtEsposter002: azure_native.consumption.Budget = new azure_native.consumption.Budget(
  budgetName,
  {
    amount: 0.01,
    budgetName,
    category: azure_native.consumption.CategoryType.Cost,
    notifications: {
      ActualCost_100_DeleteSub: {
        contactEmails: [],
        contactGroups: [devAgEsposter003InDevRg.id],
        enabled: true,
        operator: "GreaterThanOrEqualTo",
        threshold: 100,
        thresholdType: "Actual",
      },
      ActualCost_100_StopFunction: {
        contactEmails: [],
        contactGroups: [devAgEsposter001InDevRg.id],
        enabled: true,
        operator: "GreaterThanOrEqualTo",
        threshold: 100,
        thresholdType: "Actual",
      },
    },
    scope: pulumi.interpolate`subscriptions/${AzureSubscriptionId}/resourceGroups/${dShpRgEsposterAuea001.name}`,
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
