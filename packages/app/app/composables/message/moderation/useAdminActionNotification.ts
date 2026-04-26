const message = ref("");
let clearTimer: ReturnType<typeof setTimeout> | undefined;

export const useAdminActionNotification = () => {
  const isVisible = computed(() => message.value.length > 0);

  const notify = (text: string) => {
    clearTimeout(clearTimer);
    message.value = text;
    clearTimer = setTimeout(() => {
      message.value = "";
    }, 5000);
  };

  return { isVisible, message, notify };
};
