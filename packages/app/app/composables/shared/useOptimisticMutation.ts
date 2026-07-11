import { useAlertStore } from "@/store/alert";
import { getResultAsync, noop } from "@esposter/shared";
// Snapshot → apply locally → mutate in the background → rollback + alert on failure, so settings
// Controls never wait on the server round-trip. applyOptimistic captures its own snapshot and
// Returns the rollback closure. The confirming server state still arrives via subscriptions.
export const useOptimisticMutation = () => {
  const alertStore = useAlertStore();
  const { createAlert } = alertStore;
  return async (applyOptimistic: () => () => void, mutate: () => Promise<unknown>) => {
    const rollback = applyOptimistic();
    await getResultAsync(mutate).match(noop, () => {
      rollback();
      createAlert("Failed to update settings.", "error");
    });
  };
};
