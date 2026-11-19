export const useUserLinkedAccountDialogStore = defineStore("user/linkedAccountDialog", () => {
  const unlinkingProvider = ref<string>("");
  return { unlinkingProvider };
});
