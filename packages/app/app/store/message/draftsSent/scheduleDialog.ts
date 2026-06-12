import type { ScheduleDraftsSentTarget } from "@/models/message/draftsSent/ScheduleDraftsSentTarget";

import { dayjs } from "#shared/services/dayjs";

export const useDraftsSentScheduleDialogStore = defineStore("message/draftsSent/scheduleDialog", () => {
  const target = ref<ScheduleDraftsSentTarget>();
  const scheduledAt = ref(dayjs().add(1, "minute").toDate());
  const minScheduledAt = ref(new Date(scheduledAt.value));
  const isOpen = computed({
    get: () => Boolean(target.value),
    set: (value) => {
      if (!value) target.value = undefined;
    },
  });
  const open = (newTarget: ScheduleDraftsSentTarget) => {
    scheduledAt.value = dayjs().add(1, "minute").toDate();
    minScheduledAt.value = new Date(scheduledAt.value);
    target.value = newTarget;
  };
  return { isOpen, minScheduledAt, open, scheduledAt, target };
});
