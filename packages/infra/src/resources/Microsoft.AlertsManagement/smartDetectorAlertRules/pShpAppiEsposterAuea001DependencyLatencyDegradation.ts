import ApplicationTags from "@/constants/ApplicationTags";
import AzureGlobalLocation from "@/constants/AzureGlobalLocation";
import ProdAgEsposterAuea002SmartDetectorResourceId from "@/constants/ProdAgEsposterAuea002SmartDetectorResourceId";
import PShpAppiEsposterAuea001SmartDetectorResourceId from "@/constants/PShpAppiEsposterAuea001SmartDetectorResourceId";
import { pShpRgEsposterAuea001 } from "@/resources/Microsoft.Resources/resourceGroups/pShpRgEsposterAuea001";
import * as azure_native from "@pulumi/azure-native";

export const pShpAppiEsposterAuea001DependencyLatencyDegradation: azure_native.alertsmanagement.SmartDetectorAlertRule =
  new azure_native.alertsmanagement.SmartDetectorAlertRule(
    "Dependency Latency Degradation - p-shp-appi-esposter-auea-001",
    {
      actionGroups: {
        groupIds: [ProdAgEsposterAuea002SmartDetectorResourceId],
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
