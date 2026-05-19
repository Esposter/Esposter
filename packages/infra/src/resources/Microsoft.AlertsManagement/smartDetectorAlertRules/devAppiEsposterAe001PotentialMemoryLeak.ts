import ApplicationTags from "@/constants/ApplicationTags";
import AzureGlobalLocation from "@/constants/AzureGlobalLocation";
import { devAgEsposter002 } from "@/resources/Microsoft.Insights/actionGroups/devAgEsposter002";
import { devAppiEsposterAe001 } from "@/resources/Microsoft.Insights/components/devAppiEsposterAe001";
import { devRgEsposterAe001 } from "@/resources/Microsoft.Resources/resourceGroups/devRgEsposterAe001";
import { getSmartDetectorResourceId } from "@/services/getSmartDetectorResourceId";
import * as azure_native from "@pulumi/azure-native";

const alertRuleName = "Potential Memory Leak - dev-appi-esposter-ae-001";

export const devAppiEsposterAe001PotentialMemoryLeak: azure_native.alertsmanagement.SmartDetectorAlertRule =
  new azure_native.alertsmanagement.SmartDetectorAlertRule(
    alertRuleName,
    {
      actionGroups: {
        groupIds: [
          getSmartDetectorResourceId(
            devRgEsposterAe001.name,
            "microsoft.insights",
            "actiongroups",
            devAgEsposter002.name,
          ),
        ],
      },
      alertRuleName,
      description:
        "Potential Memory Leak notifies you of increased memory consumption pattern by your app which may indicate a potential memory leak.",
      detector: {
        id: "MemoryLeakDetector",
      },
      frequency: "P1D",
      location: AzureGlobalLocation,
      resourceGroupName: devRgEsposterAe001.name,
      scope: [
        getSmartDetectorResourceId(
          devRgEsposterAe001.name,
          "microsoft.insights",
          "components",
          devAppiEsposterAe001.name,
        ),
      ],
      severity: azure_native.alertsmanagement.Severity.Sev3,
      state: azure_native.alertsmanagement.AlertRuleState.Enabled,
      tags: {
        ...ApplicationTags,
      },
    },
    {
      parent: devRgEsposterAe001,
      protect: true,
    },
  );
