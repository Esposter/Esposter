import ApplicationTags from "@/constants/ApplicationTags";
import AzureGlobalLocation from "@/constants/AzureGlobalLocation";
import { devAgEsposter002 } from "@/resources/Microsoft.Insights/actionGroups/devAgEsposter002";
import { dShpAppiEsposterAuea001 } from "@/resources/Microsoft.Insights/components/dShpAppiEsposterAuea001";
import { dShpRgEsposterAuea001 } from "@/resources/Microsoft.Resources/resourceGroups/dShpRgEsposterAuea001";
import { getSmartDetectorResourceId } from "@/services/getSmartDetectorResourceId";
import * as azure_native from "@pulumi/azure-native";

const alertRuleName = "Exception Anomalies - d-shp-appi-esposter-auea-001";

export const dShpAppiEsposterAuea001ExceptionAnomalies: azure_native.alertsmanagement.SmartDetectorAlertRule =
  new azure_native.alertsmanagement.SmartDetectorAlertRule(
    alertRuleName,
    {
      actionGroups: {
        groupIds: [
          getSmartDetectorResourceId(
            dShpRgEsposterAuea001.name,
            "microsoft.insights",
            "actiongroups",
            devAgEsposter002.name,
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
      resourceGroupName: dShpRgEsposterAuea001.name,
      scope: [
        getSmartDetectorResourceId(
          dShpRgEsposterAuea001.name,
          "microsoft.insights",
          "components",
          dShpAppiEsposterAuea001.name,
        ),
      ],
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
