import ApplicationTags from "@/constants/ApplicationTags";
import AzureGlobalLocation from "@/constants/AzureGlobalLocation";
import DShpAgEsposterAuea002SmartDetectorResourceId from "@/constants/DShpAgEsposterAuea002SmartDetectorResourceId";
import DShpAppiEsposterAuea001SmartDetectorResourceId from "@/constants/DShpAppiEsposterAuea001SmartDetectorResourceId";
import { dShpRgEsposterAuea001 } from "@/resources/Microsoft.Resources/resourceGroups/dShpRgEsposterAuea001";
import * as azure_native from "@pulumi/azure-native";

export const dShpAppiEsposterAuea001ExceptionAnomalies: azure_native.alertsmanagement.SmartDetectorAlertRule =
  new azure_native.alertsmanagement.SmartDetectorAlertRule(
    "Exception Anomalies - d-shp-appi-esposter-auea-001",
    {
      actionGroups: {
        groupIds: [DShpAgEsposterAuea002SmartDetectorResourceId],
      },
      alertRuleName: "Exception Anomalies - d-shp-appi-esposter-auea-001",
      description: "Exception Anomalies notifies you of an unusual rise in the rate of exceptions thrown by your app.",
      detector: {
        id: "ExceptionVolumeChangedDetector",
      },
      frequency: "P1D",
      location: AzureGlobalLocation,
      resourceGroupName: dShpRgEsposterAuea001.name,
      scope: [DShpAppiEsposterAuea001SmartDetectorResourceId],
      severity: azure_native.alertsmanagement.Severity.Sev3,
      state: azure_native.alertsmanagement.AlertRuleState.Enabled,
      tags: {
        ...ApplicationTags,
      },
    },
    {
      protect: true,
    },
  );
