import ApplicationTags from "@/constants/ApplicationTags";
import AzureGlobalLocation from "@/constants/AzureGlobalLocation";
import { prodAgEsposter002InProdRg } from "@/resources/Microsoft.Insights/actionGroups/prodAgEsposter002InProdRg";
import { pShpAppiEsposterAuea001 } from "@/resources/Microsoft.Insights/components/pShpAppiEsposterAuea001";
import { prodRgEsposterAe001 } from "@/resources/Microsoft.Resources/resourceGroups/prodRgEsposterAe001";
import { pShpRgEsposterAuea001 } from "@/resources/Microsoft.Resources/resourceGroups/pShpRgEsposterAuea001";
import { getSmartDetectorResourceId } from "@/services/getSmartDetectorResourceId";
import * as azure_native from "@pulumi/azure-native";

const alertRuleName = "Exception Anomalies - p-shp-appi-esposter-auea-001";

export const pShpAppiEsposterAuea001ExceptionAnomalies: azure_native.alertsmanagement.SmartDetectorAlertRule =
  new azure_native.alertsmanagement.SmartDetectorAlertRule(
    alertRuleName,
    {
      actionGroups: {
        groupIds: [
          getSmartDetectorResourceId(
            prodRgEsposterAe001.name,
            "microsoft.insights",
            "actiongroups",
            prodAgEsposter002InProdRg.name,
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
      resourceGroupName: pShpRgEsposterAuea001.name,
      scope: [
        getSmartDetectorResourceId(
          pShpRgEsposterAuea001.name,
          "microsoft.insights",
          "components",
          pShpAppiEsposterAuea001.name,
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
