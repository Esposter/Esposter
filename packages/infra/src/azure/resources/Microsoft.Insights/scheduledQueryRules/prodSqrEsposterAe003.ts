import ApplicationTags from "@/azure/constants/ApplicationTags";
import AzureAustraliaEastLocation from "@/azure/constants/AzureAustraliaEastLocation";
import DeadLetterReplayFailedQuery from "@/azure/constants/DeadLetterReplayFailedQuery";
import GreaterThanConditionOperator from "@/azure/constants/GreaterThanConditionOperator";
import { prodAgEsposter002 } from "@/azure/resources/Microsoft.Insights/actionGroups/prodAgEsposter002";
import { prodAppiEsposterAe001 } from "@/azure/resources/Microsoft.Insights/components/prodAppiEsposterAe001";
import { prodRgEsposterAe001 } from "@/azure/resources/Microsoft.Resources/resourceGroups/prodRgEsposterAe001";
import * as azure_native from "@pulumi/azure-native";

const ruleName = "prod-sqr-esposter-ae-003";

export const prodSqrEsposterAe003: azure_native.monitor.ScheduledQueryRule =
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
            operator: GreaterThanConditionOperator,
            query: DeadLetterReplayFailedQuery,
            threshold: 0,
            timeAggregation: azure_native.monitor.TimeAggregation.Count,
          },
        ],
      },
      description:
        "Fires when a dead-letter replay itself keeps failing, which discards the events permanently once the subscription's 10 delivery attempts are exhausted because the replay subscription deliberately has no dead-letter destination.",
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
