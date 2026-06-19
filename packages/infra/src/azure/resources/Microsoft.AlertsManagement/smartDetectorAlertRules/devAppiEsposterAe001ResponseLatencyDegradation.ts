import ApplicationTags from "@/azure/constants/ApplicationTags";
import AzureGlobalLocation from "@/azure/constants/AzureGlobalLocation";
import { devAgEsposter002 } from "@/azure/resources/Microsoft.Insights/actionGroups/devAgEsposter002";
import { devAppiEsposterAe001 } from "@/azure/resources/Microsoft.Insights/components/devAppiEsposterAe001";
import { devRgEsposterAe001 } from "@/azure/resources/Microsoft.Resources/resourceGroups/devRgEsposterAe001";
import { getSmartDetectorResourceId } from "@/azure/services/getSmartDetectorResourceId";
import * as azure_native from "@pulumi/azure-native";

const alertRuleName = "Response Latency Degradation - dev-appi-esposter-ae-001";

export const devAppiEsposterAe001ResponseLatencyDegradation: azure_native.alertsmanagement.SmartDetectorAlertRule =
  new azure_native.alertsmanagement.SmartDetectorAlertRule(
    alertRuleName,
    {
      actionGroups: {
        groupIds: [
          getSmartDetectorResourceId(
            devRgEsposterAe001.name,
            "microsoft.insights",
            "actiongroups",
            devAgEsposter002.name,
          ),
        ],
      },
      alertRuleName,
      description:
        "Response Latency Degradation notifies you of an unusual increase in latency in your app response to requests.",
      detector: {
        id: "RequestPerformanceDegradationDetector",
      },
      frequency: "P1D",
      location: AzureGlobalLocation,
      resourceGroupName: devRgEsposterAe001.name,
      scope: [
        getSmartDetectorResourceId(
          devRgEsposterAe001.name,
          "microsoft.insights",
          "components",
          devAppiEsposterAe001.name,
        ),
      ],
      severity: azure_native.alertsmanagement.Severity.Sev3,
      state: azure_native.alertsmanagement.AlertRuleState.Enabled,
      tags: {
        ...ApplicationTags,
      },
    },
    {
      parent: devAppiEsposterAe001,
      protect: true,
    },
  );
