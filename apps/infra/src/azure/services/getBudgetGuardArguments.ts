import * as azure_native from "@pulumi/azure-native";

// Every guard budget is the same cost ceiling — the smallest amount Azure accepts, tripped at 100% of it — and
// Differs only in what it watches and which action groups it fires. Declaring the ceiling once keeps a stack
// From quietly drifting to a different one.
const getBudgetGuardNotification = (
  actionGroup: azure_native.monitor.ActionGroup,
): azure_native.types.input.consumption.NotificationArgs => ({
  contactEmails: [],
  contactGroups: [actionGroup.id],
  enabled: true,
  operator: azure_native.consumption.OperatorType.GreaterThanOrEqualTo,
  threshold: 100,
  thresholdType: azure_native.consumption.ThresholdType.Actual,
});

export const getBudgetGuardArguments = (
  stopFunctionActionGroup: azure_native.monitor.ActionGroup,
  deleteSubscriptionActionGroup: azure_native.monitor.ActionGroup,
): Pick<azure_native.consumption.BudgetArgs, "amount" | "category" | "notifications" | "timeGrain" | "timePeriod"> => ({
  amount: 0.01,
  category: azure_native.consumption.CategoryType.Cost,
  notifications: {
    ActualCost_100_DeleteSub: getBudgetGuardNotification(deleteSubscriptionActionGroup),
    ActualCost_100_StopFunction: getBudgetGuardNotification(stopFunctionActionGroup),
  },
  timeGrain: azure_native.consumption.TimeGrainType.Monthly,
  timePeriod: {
    endDate: "2035-12-31T00:00:00Z",
    startDate: "2026-05-01T00:00:00Z",
  },
});
