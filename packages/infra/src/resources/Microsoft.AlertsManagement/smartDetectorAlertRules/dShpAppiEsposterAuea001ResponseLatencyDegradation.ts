import { dShpRgEsposterAuea001 } from "@/resources/Microsoft.Resources/resourceGroups/dShpRgEsposterAuea001";
import * as azure_native from "@pulumi/azure-native";

export const dShpAppiEsposterAuea001ResponseLatencyDegradation: azure_native.alertsmanagement.SmartDetectorAlertRule =
  new azure_native.alertsmanagement.SmartDetectorAlertRule(
    "Response Latency Degradation - d-shp-appi-esposter-auea-001",
    {
      actionGroups: {
        groupIds: [
          "/subscriptions/764658ba-01da-43fa-9f26-ffa4ada33ebb/resourcegroups/d-shp-rg-esposter-auea-001/providers/microsoft.insights/actiongroups/d-shp-ag-esposter-auea-002",
        ],
      },
      alertRuleName: "Response Latency Degradation - d-shp-appi-esposter-auea-001",
      description:
        "Response Latency Degradation notifies you of an unusual increase in latency in your app response to requests.",
      detector: {
        id: "RequestPerformanceDegradationDetector",
      },
      frequency: "P1D",
      location: "global",
      resourceGroupName: dShpRgEsposterAuea001.name,
      scope: [
        "/subscriptions/764658ba-01da-43fa-9f26-ffa4ada33ebb/resourcegroups/d-shp-rg-esposter-auea-001/providers/microsoft.insights/components/d-shp-appi-esposter-auea-001",
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
