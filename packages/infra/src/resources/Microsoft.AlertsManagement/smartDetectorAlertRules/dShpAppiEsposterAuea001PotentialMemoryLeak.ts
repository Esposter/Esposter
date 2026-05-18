import ApplicationTags from "@/constants/ApplicationTags";
import AzureGlobalLocation from "@/constants/AzureGlobalLocation";
import DevAgEsposterAuea002SmartDetectorResourceId from "@/constants/DevAgEsposterAuea002SmartDetectorResourceId";
import DShpAppiEsposterAuea001SmartDetectorResourceId from "@/constants/DShpAppiEsposterAuea001SmartDetectorResourceId";
import { dShpRgEsposterAuea001 } from "@/resources/Microsoft.Resources/resourceGroups/dShpRgEsposterAuea001";
import * as azure_native from "@pulumi/azure-native";

export const dShpAppiEsposterAuea001PotentialMemoryLeak: azure_native.alertsmanagement.SmartDetectorAlertRule =
  new azure_native.alertsmanagement.SmartDetectorAlertRule(
    "Potential Memory Leak - d-shp-appi-esposter-auea-001",
    {
      actionGroups: {
        groupIds: [DevAgEsposterAuea002SmartDetectorResourceId],
      },
      alertRuleName: "Potential Memory Leak - d-shp-appi-esposter-auea-001",
      description:
        "Potential Memory Leak notifies you of increased memory consumption pattern by your app which may indicate a potential memory leak.",
      detector: {
        id: "MemoryLeakDetector",
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
