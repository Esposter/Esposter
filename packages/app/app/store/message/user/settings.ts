export const useSettingsStore = defineStore("message/user/settings", () => {
  const dialog = ref(false);
  return {
    dialog,
  };
});
