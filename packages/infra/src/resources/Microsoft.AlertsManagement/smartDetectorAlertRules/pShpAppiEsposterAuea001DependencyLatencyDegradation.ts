import ApplicationTags from "@/constants/ApplicationTags";
import AzureGlobalLocation from "@/constants/AzureGlobalLocation";
import { prodAgEsposterAuea002 } from "@/resources/Microsoft.Insights/actionGroups/prodAgEsposterAuea002";
import { pShpAppiEsposterAuea001 } from "@/resources/Microsoft.Insights/components/pShpAppiEsposterAuea001";
import { pShpRgEsposterAuea001 } from "@/resources/Microsoft.Resources/resourceGroups/pShpRgEsposterAuea001";
import { getSmartDetectorResourceId } from "@/services/getSmartDetectorResourceId";
import * as azure_native from "@pulumi/azure-native";

export const pShpAppiEsposterAuea001DependencyLatencyDegradation: azure_native.alertsmanagement.SmartDetectorAlertRule =
  new azure_native.alertsmanagement.SmartDetectorAlertRule(
    "Dependency Latency Degradation - p-shp-appi-esposter-auea-001",
    {
      actionGroups: {
        groupIds: [
          getSmartDetectorResourceId(
            pShpRgEsposterAuea001.name,
            "microsoft.insights",
            "actiongroups",
            prodAgEsposterAuea002.name,
          ),
        ],
      },
      alertRuleName: "Dependency Latency Degradation - p-shp-appi-esposter-auea-001",
      description:
        "Dependency Latency Degradation notifies you of an unusual increase in response by a dependency your app is calling (e.g. REST API or database)",
      detector: {
        id: "DependencyPerformanceDegradationDetector",
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
