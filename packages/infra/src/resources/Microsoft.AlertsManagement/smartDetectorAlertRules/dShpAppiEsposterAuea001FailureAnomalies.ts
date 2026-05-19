import ApplicationTags from "@/constants/ApplicationTags";
import AzureGlobalLocation from "@/constants/AzureGlobalLocation";
import { devAgEsposter002InDevRg } from "@/resources/Microsoft.Insights/actionGroups/devAgEsposter002InDevRg";
import { dShpAppiEsposterAuea001 } from "@/resources/Microsoft.Insights/components/dShpAppiEsposterAuea001";
import { devRgEsposterAe001 } from "@/resources/Microsoft.Resources/resourceGroups/devRgEsposterAe001";
import { dShpRgEsposterAuea001 } from "@/resources/Microsoft.Resources/resourceGroups/dShpRgEsposterAuea001";
import { getSmartDetectorResourceId } from "@/services/getSmartDetectorResourceId";
import * as azure_native from "@pulumi/azure-native";

const alertRuleName = "Failure Anomalies - d-shp-appi-esposter-auea-001";

export const dShpAppiEsposterAuea001FailureAnomalies: azure_native.alertsmanagement.SmartDetectorAlertRule =
  new azure_native.alertsmanagement.SmartDetectorAlertRule(
    alertRuleName,
    {
      actionGroups: {
        groupIds: [
          getSmartDetectorResourceId(
            devRgEsposterAe001.name,
            "microsoft.insights",
            "actiongroups",
            devAgEsposter002InDevRg.name,
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
