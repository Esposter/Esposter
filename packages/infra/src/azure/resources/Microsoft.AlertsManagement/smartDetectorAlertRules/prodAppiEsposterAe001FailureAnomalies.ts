import ApplicationTags from "@/azure/constants/ApplicationTags";
import AzureGlobalLocation from "@/azure/constants/AzureGlobalLocation";
import { prodAgEsposter002 } from "@/azure/resources/Microsoft.Insights/actionGroups/prodAgEsposter002";
import { prodAppiEsposterAe001 } from "@/azure/resources/Microsoft.Insights/components/prodAppiEsposterAe001";
import { prodRgEsposterAe001 } from "@/azure/resources/Microsoft.Resources/resourceGroups/prodRgEsposterAe001";
import { getSmartDetectorResourceId } from "@/azure/services/getSmartDetectorResourceId";
import * as azure_native from "@pulumi/azure-native";

const alertRuleName = "Failure Anomalies - prod-appi-esposter-ae-001";

export const prodAppiEsposterAe001FailureAnomalies: azure_native.alertsmanagement.SmartDetectorAlertRule =
  new azure_native.alertsmanagement.SmartDetectorAlertRule(
    alertRuleName,
    {
      actionGroups: {
        groupIds: [
          getSmartDetectorResourceId(
            prodRgEsposterAe001.name,
            "microsoft.insights",
            "actiongroups",
            prodAgEsposter002.name,
          ),
        ],
      },
      alertRuleName,
      description:
        "Failure Anomalies notifies you of an unusual rise in the rate of failed HTTP requests or dependency calls.",
      detector: {
        id: "FailureAnomaliesDetector",
      },
      frequency: "PT1M",
      location: AzureGlobalLocation,
      resourceGroupName: prodRgEsposterAe001.name,
      scope: [
        getSmartDetectorResourceId(
          prodRgEsposterAe001.name,
          "microsoft.insights",
          "components",
          prodAppiEsposterAe001.name,
        ),
      ],
      severity: azure_native.alertsmanagement.Severity.Sev3,
      state: azure_native.alertsmanagement.AlertRuleState.Enabled,
      tags: {
        ...ApplicationTags,
      },
    },
    {
      parent: prodAppiEsposterAe001,
      protect: true,
    },
  );
