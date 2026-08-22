import type { VAlert } from "vuetify/components";

import { dayjs } from "#shared/services/dayjs";
import { AlertIconMap } from "@/services/vuetify/AlertIconMap";
import { getIsServer } from "@esposter/shared";

// The four props the alert list renders, rather than the whole `VAlert` prop surface: matching an alert already
// On screen compares two of them, and doing that across every prop v-alert accepts blows the instantiation depth
interface Alert extends Pick<VAlert["$props"], "icon" | "location" | "text" | "type"> {
  id: string;
}

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
    }, dayjs.duration(5, "seconds").asMilliseconds());
    alertTimeoutMap.set(id, timeoutId);
  };
  const createAlert = (
    text: VAlert["$props"]["text"],
    type: NonNullable<VAlert["$props"]["type"]>,
    props?: Pick<VAlert["$props"], "icon" | "location">,
  ) => {
    if (getIsServer()) return;
    // One cause routinely rejects several operations at once — the file and thumbnail reads of a single
    // Attachment batch, every chunk of a paged sweep — and each rejection arrives here on its own. A toast per
    // Operation says nothing the first one did not, so an identical alert still on screen is refreshed instead
    const existingAlert = alerts.value.find((alert) => alert.text === text && alert.type === type);
    if (existingAlert) {
      scheduleAlertDismissal(existingAlert.id);
      return;
    }

    const id = crypto.randomUUID();
    alerts.value.push({ icon: AlertIconMap[type], id, location: "bottom center", text, type, ...props });
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
