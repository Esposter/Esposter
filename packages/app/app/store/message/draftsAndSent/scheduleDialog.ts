import type { ScheduleDraftsAndSentTarget } from "@/models/message/draftsAndSent/ScheduleDraftsAndSentTarget";

import { getEarliestScheduledAt } from "@/services/message/getEarliestScheduledAt";

export const useDraftsAndSentScheduleDialogStore = defineStore("message/draftsAndSent/scheduleDialog", () => {
  const target = ref<ScheduleDraftsAndSentTarget>();
  const scheduledAt = ref(getEarliestScheduledAt());
  // A copy of the instant `scheduledAt` opens on rather than a second `getEarliestScheduledAt()` call, so the picker's own
  // Initial value can never sit a few microseconds below its minimum and open already invalid
  const minScheduledAt = ref(new Date(scheduledAt.value));
  const isOpen = computed({
    get: () => Boolean(target.value),
    set: (value) => {
      if (!value) target.value = undefined;
    },
  });
  const open = (newTarget: ScheduleDraftsAndSentTarget) => {
    scheduledAt.value = getEarliestScheduledAt();
    minScheduledAt.value = new Date(scheduledAt.value);
    target.value = newTarget;
  };
  return { isOpen, minScheduledAt, open, scheduledAt, target };
});
