export const useUserApiKeyDialogStore = defineStore("user/apiKeyDialog", () => {
  const deletingId = ref("");
  return { deletingId };
});
