import ApplicationTags from "@/azure/constants/ApplicationTags";
import AzureGlobalLocation from "@/azure/constants/AzureGlobalLocation";
import { prodAgEsposter002 } from "@/azure/resources/Microsoft.Insights/actionGroups/prodAgEsposter002";
import { prodAppiEsposterAe001 } from "@/azure/resources/Microsoft.Insights/components/prodAppiEsposterAe001";
import { prodRgEsposterAe001 } from "@/azure/resources/Microsoft.Resources/resourceGroups/prodRgEsposterAe001";
import { getSmartDetectorResourceId } from "@/azure/services/getSmartDetectorResourceId";
import * as azure_native from "@pulumi/azure-native";

const alertRuleName = "Dependency Latency Degradation - prod-appi-esposter-ae-001";

export const prodAppiEsposterAe001DependencyLatencyDegradation: azure_native.alertsmanagement.SmartDetectorAlertRule =
  new azure_native.alertsmanagement.SmartDetectorAlertRule(
    alertRuleName,
    {
      actionGroups: {
        groupIds: [
          getSmartDetectorResourceId(
            prodRgEsposterAe001.name,
            "microsoft.insights",
            "actiongroups",
            prodAgEsposter002.name,
          ),
        ],
      },
      alertRuleName,
      description:
        "Dependency Latency Degradation notifies you of an unusual increase in response by a dependency your app is calling (e.g. REST API or database)",
      detector: {
        id: "DependencyPerformanceDegradationDetector",
      },
      frequency: "P1D",
      location: AzureGlobalLocation,
      resourceGroupName: prodRgEsposterAe001.name,
      scope: [
        getSmartDetectorResourceId(
          prodRgEsposterAe001.name,
          "microsoft.insights",
          "components",
          prodAppiEsposterAe001.name,
        ),
      ],
      severity: azure_native.alertsmanagement.Severity.Sev3,
      state: azure_native.alertsmanagement.AlertRuleState.Enabled,
      tags: {
        ...ApplicationTags,
      },
    },
    {
      parent: prodAppiEsposterAe001,
      protect: true,
    },
  );
