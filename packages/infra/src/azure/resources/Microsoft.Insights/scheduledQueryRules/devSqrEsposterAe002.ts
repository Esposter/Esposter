import ApplicationTags from "@/azure/constants/ApplicationTags";
import AzureAustraliaEastLocation from "@/azure/constants/AzureAustraliaEastLocation";
import DeadLetterQuarantinedQuery from "@/azure/constants/DeadLetterQuarantinedQuery";
import GreaterThanConditionOperator from "@/azure/constants/GreaterThanConditionOperator";
import { devAgEsposter002 } from "@/azure/resources/Microsoft.Insights/actionGroups/devAgEsposter002";
import { devAppiEsposterAe001 } from "@/azure/resources/Microsoft.Insights/components/devAppiEsposterAe001";
import { devRgEsposterAe001 } from "@/azure/resources/Microsoft.Resources/resourceGroups/devRgEsposterAe001";
import * as azure_native from "@pulumi/azure-native";

const ruleName = "dev-sqr-esposter-ae-002";

export const devSqrEsposterAe002: azure_native.monitor.ScheduledQueryRule = new azure_native.monitor.ScheduledQueryRule(
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
          query: DeadLetterQuarantinedQuery,
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
    resourceGroupName: devRgEsposterAe001.name,
    ruleName,
    scopes: [devAppiEsposterAe001.id],
    severity: 1,
    tags: {
      ...ApplicationTags,
    },
    windowSize: "PT1H",
  },
  {
    parent: devRgEsposterAe001,
    protect: true,
  },
);
