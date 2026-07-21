import ApplicationTags from "@/azure/constants/ApplicationTags";
import AzureAustraliaEastLocation from "@/azure/constants/AzureAustraliaEastLocation";
import GreaterThanConditionOperator from "@/azure/constants/GreaterThanConditionOperator";
import LogAnalyticsOverQuotaQuery from "@/azure/constants/LogAnalyticsOverQuotaQuery";
import { devAgEsposter002 } from "@/azure/resources/Microsoft.Insights/actionGroups/devAgEsposter002";
import { devLogEsposterAe001 } from "@/azure/resources/Microsoft.OperationalInsights/workspaces/devLogEsposterAe001";
import { devRgEsposterAe001 } from "@/azure/resources/Microsoft.Resources/resourceGroups/devRgEsposterAe001";
import * as azure_native from "@pulumi/azure-native";

const ruleName = "dev-sqr-esposter-ae-001";

export const devSqrEsposterAe001: azure_native.monitor.ScheduledQueryRule = new azure_native.monitor.ScheduledQueryRule(
  ruleName,
  {
    actions: {
      actionGroups: [devAgEsposter002.id],
    },
    autoMitigate: true,
    criteria: {
      allOf: [
        {
          failingPeriods: {
            minFailingPeriodsToAlert: 1,
            numberOfEvaluationPeriods: 1,
          },
          operator: GreaterThanConditionOperator,
          query: LogAnalyticsOverQuotaQuery,
          threshold: 0,
          timeAggregation: azure_native.monitor.TimeAggregation.Count,
        },
      ],
    },
    description: "Fires when the Log Analytics workspace hits its daily ingestion cap and starts dropping telemetry.",
    enabled: true,
    evaluationFrequency: "PT1H",
    kind: azure_native.monitor.Kind.LogAlert,
    location: AzureAustraliaEastLocation,
    resourceGroupName: devRgEsposterAe001.name,
    ruleName,
    scopes: [devLogEsposterAe001.id],
    severity: 1,
    tags: {
      ...ApplicationTags,
    },
    windowSize: "P1D",
  },
  {
    parent: devRgEsposterAe001,
    protect: true,
  },
);
