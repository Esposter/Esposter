import AzureSubscriptionId from "@/constants/AzureSubscriptionId";
import { dShpAgEsposterAuea001 } from "@/resources/Microsoft.Insights/actionGroups/dShpAgEsposterAuea001";
import { dShpAgEsposterAuea003 } from "@/resources/Microsoft.Insights/actionGroups/dShpAgEsposterAuea003";
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
