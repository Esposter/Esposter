import type { ScheduleDraftsAndSentTarget } from "@/models/message/draftsAndSent/ScheduleDraftsAndSentTarget";

import { dayjs } from "#shared/services/dayjs";

export const useDraftsAndSentScheduleDialogStore = defineStore("message/draftsAndSent/scheduleDialog", () => {
  const target = ref<ScheduleDraftsAndSentTarget>();
  const scheduledAt = ref(dayjs().add(1, "minute").toDate());
  const minScheduledAt = ref(new Date(scheduledAt.value));
  const isOpen = computed({
    get: () => Boolean(target.value),
    set: (value) => {
      if (!value) target.value = undefined;
    },
  });
  const open = (newTarget: ScheduleDraftsAndSentTarget) => {
    scheduledAt.value = dayjs().add(1, "minute").toDate();
    minScheduledAt.value = new Date(scheduledAt.value);
    target.value = newTarget;
  };
  return { isOpen, minScheduledAt, open, scheduledAt, target };
});
