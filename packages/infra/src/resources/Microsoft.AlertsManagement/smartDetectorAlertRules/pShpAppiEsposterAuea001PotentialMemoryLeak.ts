import ApplicationTags from "@/constants/ApplicationTags";
import AzureGlobalLocation from "@/constants/AzureGlobalLocation";
import PShpAgEsposterAuea002SmartDetectorResourceId from "@/constants/PShpAgEsposterAuea002SmartDetectorResourceId";
import PShpAppiEsposterAuea001SmartDetectorResourceId from "@/constants/PShpAppiEsposterAuea001SmartDetectorResourceId";
import { pShpRgEsposterAuea001 } from "@/resources/Microsoft.Resources/resourceGroups/pShpRgEsposterAuea001";
import * as azure_native from "@pulumi/azure-native";

export const pShpAppiEsposterAuea001PotentialMemoryLeak: azure_native.alertsmanagement.SmartDetectorAlertRule =
  new azure_native.alertsmanagement.SmartDetectorAlertRule(
    "Potential Memory Leak - p-shp-appi-esposter-auea-001",
    {
      actionGroups: {
        groupIds: [PShpAgEsposterAuea002SmartDetectorResourceId],
      },
      alertRuleName: "Potential Memory Leak - p-shp-appi-esposter-auea-001",
      description:
        "Potential Memory Leak notifies you of increased memory consumption pattern by your app which may indicate a potential memory leak.",
      detector: {
        id: "MemoryLeakDetector",
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
