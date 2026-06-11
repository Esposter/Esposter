import { ScheduledMessageJobType } from "@esposter/db-schema";

export const useScheduledMessageJobDialogStore = defineStore("message/input/scheduledMessageJobDialog", () => {
  const isOpen = ref(false);
  const type = ref(ScheduledMessageJobType.Reminder);
  const open = (newType: ScheduledMessageJobType) => {
    type.value = newType;
    isOpen.value = true;
  };
  return { isOpen, open, type };
});
