import ApplicationTags from "@/constants/ApplicationTags";
import AzureGlobalLocation from "@/constants/AzureGlobalLocation";
import { devAgEsposter002 } from "@/resources/Microsoft.Insights/actionGroups/devAgEsposter002";
import { devAppiEsposterAuea001 } from "@/resources/Microsoft.Insights/components/devAppiEsposterAuea001";
import { devRgEsposterAuea001 } from "@/resources/Microsoft.Resources/resourceGroups/devRgEsposterAuea001";
import { getSmartDetectorResourceId } from "@/services/getSmartDetectorResourceId";
import * as azure_native from "@pulumi/azure-native";

const alertRuleName = "Response Latency Degradation - dev-appi-esposter-auea-001";

export const devAppiEsposterAuea001ResponseLatencyDegradation: azure_native.alertsmanagement.SmartDetectorAlertRule =
  new azure_native.alertsmanagement.SmartDetectorAlertRule(
    alertRuleName,
    {
      actionGroups: {
        groupIds: [
          getSmartDetectorResourceId(
            devRgEsposterAuea001.name,
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
      resourceGroupName: devRgEsposterAuea001.name,
      scope: [
        getSmartDetectorResourceId(
          devRgEsposterAuea001.name,
          "microsoft.insights",
          "components",
          devAppiEsposterAuea001.name,
        ),
      ],
      severity: azure_native.alertsmanagement.Severity.Sev3,
      state: azure_native.alertsmanagement.AlertRuleState.Enabled,
      tags: {
        ...ApplicationTags,
      },
    },
    {
      parent: devAppiEsposterAuea001,
      protect: true,
    },
  );
