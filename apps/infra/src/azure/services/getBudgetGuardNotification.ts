import * as azure_native from "@pulumi/azure-native";

// Every guard budget is the same cost ceiling — the smallest amount Azure accepts, tripped at 100% of it — and
// Differs only in what it watches and which action groups it fires. Declaring the ceiling once keeps a stack
// From quietly drifting to a different one.
export const getBudgetGuardNotification = (
  actionGroup: azure_native.monitor.ActionGroup,
): azure_native.types.input.consumption.NotificationArgs => ({
  contactEmails: [],
  contactGroups: [actionGroup.id],
  enabled: true,
  operator: azure_native.consumption.OperatorType.GreaterThanOrEqualTo,
  threshold: 100,
  thresholdType: azure_native.consumption.ThresholdType.Actual,
});
