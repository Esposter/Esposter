import ApplicationTags from "@/azure/constants/ApplicationTags";
import AzureAustraliaEastLocation from "@/azure/constants/AzureAustraliaEastLocation";
import { prodAgEsposter002 } from "@/azure/resources/Microsoft.Insights/actionGroups/prodAgEsposter002";
import { prodAppiEsposterAe001 } from "@/azure/resources/Microsoft.Insights/components/prodAppiEsposterAe001";
import { prodRgEsposterAe001 } from "@/azure/resources/Microsoft.Resources/resourceGroups/prodRgEsposterAe001";
import { AzureFunction } from "@esposter/db-schema";
import * as azure_native from "@pulumi/azure-native";

const ruleName = "prod-sqr-esposter-ae-002";

export const prodSqrEsposterAe002: azure_native.monitor.ScheduledQueryRule =
  new azure_native.monitor.ScheduledQueryRule(
    ruleName,
    {
      actions: {
        actionGroups: [prodAgEsposter002.id],
      },
      autoMitigate: true,
      criteria: {
        allOf: [
          {
            failingPeriods: {
              minFailingPeriodsToAlert: 1,
              numberOfEvaluationPeriods: 1,
            },
            // Azure-native types this as ConditionOperator, whose values are the metric-alert forms ("gt").
            // Scheduled query rules of kind LogAlert take the ARM spelling, which the API rejects otherwise.
            operator: "GreaterThan",
            query: `traces | where message startswith "${AzureFunction.ReplayDeadLetterEvent} quarantined"`,
            threshold: 0,
            timeAggregation: azure_native.monitor.TimeAggregation.Count,
          },
        ],
      },
      description:
        "Fires when the dead-letter replay quarantines a payload, which is never retried again without a human.",
      enabled: true,
      evaluationFrequency: "PT1H",
      kind: azure_native.monitor.Kind.LogAlert,
      location: AzureAustraliaEastLocation,
      resourceGroupName: prodRgEsposterAe001.name,
      ruleName,
      scopes: [prodAppiEsposterAe001.id],
      severity: 1,
      tags: {
        ...ApplicationTags,
      },
      windowSize: "PT1H",
    },
    {
      parent: prodRgEsposterAe001,
      protect: true,
    },
  );
