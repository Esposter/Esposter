import AzureSubscriptionId from "@/constants/AzureSubscriptionId";
import { pShpEvgtEsposterAuea001 } from "@/resources/Microsoft.EventGrid/topics/pShpEvgtEsposterAuea001";
import { prodAgEsposterAuea001 } from "@/resources/Microsoft.Insights/actionGroups/prodAgEsposterAuea001";
import { prodAgEsposterAuea003 } from "@/resources/Microsoft.Insights/actionGroups/prodAgEsposterAuea003";
import { pShpRgEsposterAuea001 } from "@/resources/Microsoft.Resources/resourceGroups/pShpRgEsposterAuea001";
import * as azure_native from "@pulumi/azure-native";
import * as pulumi from "@pulumi/pulumi";

const budgetName = "p-shp-bdg-esposter-auea-002";

export const pShpBdgEsposterAuea002: azure_native.consumption.Budget = new azure_native.consumption.Budget(
  budgetName,
  {
    amount: 0.01,
    budgetName,
    category: azure_native.consumption.CategoryType.Cost,
    filter: {
      dimensions: {
        name: "ResourceId",
        operator: azure_native.consumption.BudgetOperatorType.In,
        values: [pShpEvgtEsposterAuea001.id],
      },
    },
    notifications: {
      ActualCost_100_DeleteSub: {
        contactEmails: [],
        contactGroups: [prodAgEsposterAuea003.id],
        enabled: true,
        operator: "GreaterThanOrEqualTo",
        threshold: 100,
        thresholdType: "Actual",
      },
      ActualCost_100_StopFunction: {
        contactEmails: [],
        contactGroups: [prodAgEsposterAuea001.id],
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
      startDate: "2025-11-01T00:00:00Z",
    },
  },
  {
    protect: true,
  },
);
