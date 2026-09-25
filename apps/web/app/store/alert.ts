import type { Alert } from "@/models/shared/Alert";

import { TOAST_DURATION_MS } from "@/services/ui/constants";
import { checkIsServer } from "@esposter/shared";

export const useAlertStore = defineStore("alert", () => {
  const alerts = ref<Alert[]>([]);
  const alertTimeoutMap = new Map<string, number>();
  // Restarted rather than stacked, so a repeat of an alert already on screen extends the time the user has to
  // Read it instead of queueing a second copy behind it
  const scheduleAlertDismissal = (id: string) => {
    const previousTimeoutId = alertTimeoutMap.get(id);
    if (previousTimeoutId) clearTimeout(previousTimeoutId);

    const timeoutId = window.setTimeout(() => {
      deleteAlert(id);
    }, TOAST_DURATION_MS);
    alertTimeoutMap.set(id, timeoutId);
  };
  const createAlert = (text: Alert["text"], type: Alert["type"], props?: Pick<Alert, "icon">) => {
    if (checkIsServer()) return;
    // One cause routinely rejects several operations at once — the file and thumbnail reads of a single
    // Attachment batch, every chunk of a paged sweep — and each rejection arrives here on its own. A toast per
    // Operation says nothing the first one did not, so an identical alert still on screen is refreshed instead
    const existingAlert = alerts.value.find((alert) => alert.text === text && alert.type === type);
    if (existingAlert) {
      scheduleAlertDismissal(existingAlert.id);
      return;
    }

    const id = crypto.randomUUID();
    alerts.value.push({ id, text, type, ...props });
    scheduleAlertDismissal(id);
  };
  const deleteAlert = (id: string) => {
    const index = alerts.value.findIndex((alert) => alert.id === id);
    if (index === -1) return;

    alerts.value = alerts.value.toSpliced(index, 1);
    const timeoutId = alertTimeoutMap.get(id);
    if (!timeoutId) return;

    clearTimeout(timeoutId);
    alertTimeoutMap.delete(id);
  };
  return { alerts, createAlert, deleteAlert };
});
