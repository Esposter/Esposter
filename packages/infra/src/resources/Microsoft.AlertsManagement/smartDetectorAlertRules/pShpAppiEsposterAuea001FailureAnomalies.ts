import ApplicationTags from "@/constants/ApplicationTags";
import AzureGlobalLocation from "@/constants/AzureGlobalLocation";
import PShpAgEsposterAuea002SmartDetectorResourceId from "@/constants/PShpAgEsposterAuea002SmartDetectorResourceId";
import PShpAppiEsposterAuea001SmartDetectorResourceId from "@/constants/PShpAppiEsposterAuea001SmartDetectorResourceId";
import { pShpRgEsposterAuea001 } from "@/resources/Microsoft.Resources/resourceGroups/pShpRgEsposterAuea001";
import * as azure_native from "@pulumi/azure-native";

export const pShpAppiEsposterAuea001FailureAnomalies: azure_native.alertsmanagement.SmartDetectorAlertRule =
  new azure_native.alertsmanagement.SmartDetectorAlertRule(
    "Failure Anomalies - p-shp-appi-esposter-auea-001",
    {
      actionGroups: {
        groupIds: [PShpAgEsposterAuea002SmartDetectorResourceId],
      },
      alertRuleName: "Failure Anomalies - p-shp-appi-esposter-auea-001",
      description:
        "Failure Anomalies notifies you of an unusual rise in the rate of failed HTTP requests or dependency calls.",
      detector: {
        id: "FailureAnomaliesDetector",
      },
      frequency: "PT1M",
      location: AzureGlobalLocation,
      resourceGroupName: pShpRgEsposterAuea001.name,
      scope: [PShpAppiEsposterAuea001SmartDetectorResourceId],
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
