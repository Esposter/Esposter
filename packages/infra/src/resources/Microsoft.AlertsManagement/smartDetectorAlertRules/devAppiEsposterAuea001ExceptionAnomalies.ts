import ApplicationTags from "@/constants/ApplicationTags";
import AzureGlobalLocation from "@/constants/AzureGlobalLocation";
import { devAgEsposterAuea002 } from "@/resources/Microsoft.Insights/actionGroups/devAgEsposterAuea002";
import { devAppiEsposterAuea001 } from "@/resources/Microsoft.Insights/components/devAppiEsposterAuea001";
import { devRgEsposterAuea001 } from "@/resources/Microsoft.Resources/resourceGroups/devRgEsposterAuea001";
import { getSmartDetectorResourceId } from "@/services/getSmartDetectorResourceId";
import * as azure_native from "@pulumi/azure-native";

const alertRuleName = "Exception Anomalies - dev-appi-esposter-auea-001";

export const devAppiEsposterAuea001ExceptionAnomalies: azure_native.alertsmanagement.SmartDetectorAlertRule =
  new azure_native.alertsmanagement.SmartDetectorAlertRule(
    alertRuleName,
    {
      actionGroups: {
        groupIds: [
          getSmartDetectorResourceId(
            devRgEsposterAuea001.name,
            "microsoft.insights",
            "actiongroups",
            devAgEsposterAuea002.name,
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
