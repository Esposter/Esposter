import AzureSubscriptionId from "@/constants/AzureSubscriptionId";
import { devAgEsposterAuea001 } from "@/resources/Microsoft.Insights/actionGroups/devAgEsposterAuea001";
import { devAgEsposterAuea003 } from "@/resources/Microsoft.Insights/actionGroups/devAgEsposterAuea003";
import { dShpRgEsposterAuea001 } from "@/resources/Microsoft.Resources/resourceGroups/dShpRgEsposterAuea001";
import * as azure_native from "@pulumi/azure-native";
import * as pulumi from "@pulumi/pulumi";

export const dShpBdgEsposterAuea002: azure_native.consumption.Budget = new azure_native.consumption.Budget(
  "d-shp-bdg-esposter-auea-002",
  {
    amount: 0.01,
    budgetName: "d-shp-bdg-esposter-auea-002",
    category: azure_native.consumption.CategoryType.Cost,
    notifications: {
      ActualCost_100_DeleteSub: {
        contactEmails: [],
        contactGroups: [devAgEsposterAuea003.id],
        enabled: true,
        operator: "GreaterThanOrEqualTo",
        threshold: 100,
        thresholdType: "Actual",
      },
      ActualCost_100_StopFunction: {
        contactEmails: [],
        contactGroups: [devAgEsposterAuea001.id],
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
      startDate: "2025-11-01T00:00:00Z",
    },
  },
  {
    protect: true,
  },
);
