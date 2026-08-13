import type { ScheduleDraftsAndSentTarget } from "@/models/message/draftsAndSent/ScheduleDraftsAndSentTarget";

import { dayjs } from "#shared/services/dayjs";

// The soonest a message may be scheduled for, and therefore also what the picker opens on: a job the user
// Confirms without touching the picker still runs in the future.
const SCHEDULE_LEAD_TIME_MINUTES = 1;
const getEarliestScheduledAt = () => dayjs().add(SCHEDULE_LEAD_TIME_MINUTES, "minute").toDate();

export const useDraftsAndSentScheduleDialogStore = defineStore("message/draftsAndSent/scheduleDialog", () => {
  const target = ref<ScheduleDraftsAndSentTarget>();
  const scheduledAt = ref(getEarliestScheduledAt());
  // A copy of the instant `scheduledAt` opens on rather than a second `dayjs()` call, so the picker's own
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
