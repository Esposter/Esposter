import { pShpRgEsposterAuea001 } from "@/resources/Microsoft.Resources/resourceGroups/pShpRgEsposterAuea001";
import * as azure_native from "@pulumi/azure-native";

export const pShpAppiEsposterAuea001DependencyLatencyDegradation: azure_native.alertsmanagement.SmartDetectorAlertRule =
  new azure_native.alertsmanagement.SmartDetectorAlertRule(
    "Dependency Latency Degradation - p-shp-appi-esposter-auea-001",
    {
      actionGroups: {
        groupIds: [
          "/subscriptions/764658ba-01da-43fa-9f26-ffa4ada33ebb/resourcegroups/p-shp-rg-esposter-auea-001/providers/microsoft.insights/actiongroups/p-shp-ag-esposter-auea-002",
        ],
      },
      alertRuleName: "Dependency Latency Degradation - p-shp-appi-esposter-auea-001",
      description:
        "Dependency Latency Degradation notifies you of an unusual increase in response by a dependency your app is calling (e.g. REST API or database)",
      detector: {
        id: "DependencyPerformanceDegradationDetector",
      },
      frequency: "P1D",
      location: "global",
      resourceGroupName: pShpRgEsposterAuea001.name,
      scope: [
        "/subscriptions/764658ba-01da-43fa-9f26-ffa4ada33ebb/resourcegroups/p-shp-rg-esposter-auea-001/providers/microsoft.insights/components/p-shp-appi-esposter-auea-001",
      ],
      severity: azure_native.alertsmanagement.Severity.Sev3,
      state: azure_native.alertsmanagement.AlertRuleState.Enabled,
      tags: {
        Application: "Esposter",
      },
    },
    {
      protect: true,
    },
  );
