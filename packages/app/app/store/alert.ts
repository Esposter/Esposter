import type { VAlert } from "vuetify/components";

import { dayjs } from "#shared/services/dayjs";
import { AlertIconMap } from "@/services/vuetify/AlertIconMap";
import { getIsServer } from "@esposter/shared";

export const useAlertStore = defineStore("alert", () => {
  const alerts = ref<(VAlert["$props"] & { id: string })[]>([]);
  const alertTimeoutMap = new Map<string, number>();
  const createAlert = (
    text: VAlert["$props"]["text"],
    type: NonNullable<VAlert["$props"]["type"]>,
    props?: Pick<VAlert["$props"], "icon" | "location">,
  ) => {
    if (getIsServer()) return;

    const id = crypto.randomUUID();
    alerts.value.push({ icon: AlertIconMap[type], id, location: "bottom center", text, type, ...props });
    const timeoutId = window.setTimeout(() => {
      deleteAlert(id);
    }, dayjs.duration(5, "seconds").asMilliseconds());
    alertTimeoutMap.set(id, timeoutId);
  };
  const deleteAlert = (id: string) => {
    const index = alerts.value.findIndex((alert) => alert.id === id);
    if (index === -1) return;

    alerts.value.splice(index, 1);
    const timeoutId = alertTimeoutMap.get(id);
    if (!timeoutId) return;

    clearTimeout(timeoutId);
    alertTimeoutMap.delete(id);
  };
  return { alerts, createAlert, deleteAlert };
});
