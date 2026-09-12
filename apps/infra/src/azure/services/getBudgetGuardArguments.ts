import { getBudgetGuardNotification } from "#src/azure/services/getBudgetGuardNotification";
import * as azure_native from "@pulumi/azure-native";

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
