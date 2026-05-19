import ApplicationTags from "@/constants/ApplicationTags";
import AzureGlobalLocation from "@/constants/AzureGlobalLocation";
import { prodAgEsposter002 } from "@/resources/Microsoft.Insights/actionGroups/prodAgEsposter002";
import { prodAppiEsposterAe001 } from "@/resources/Microsoft.Insights/components/prodAppiEsposterAe001";
import { prodRgEsposterAe001 } from "@/resources/Microsoft.Resources/resourceGroups/prodRgEsposterAe001";
import { getSmartDetectorResourceId } from "@/services/getSmartDetectorResourceId";
import * as azure_native from "@pulumi/azure-native";

const alertRuleName = "Exception Anomalies - prod-appi-esposter-ae-001";

export const prodAppiEsposterAe001ExceptionAnomalies: azure_native.alertsmanagement.SmartDetectorAlertRule =
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
      description: "Exception Anomalies notifies you of an unusual rise in the rate of exceptions thrown by your app.",
      detector: {
        id: "ExceptionVolumeChangedDetector",
      },
      frequency: "P1D",
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
      parent: prodRgEsposterAe001,
      protect: true,
    },
  );
