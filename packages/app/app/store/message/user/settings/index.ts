import type { UpdateUserSettingsInput } from "#shared/models/db/userSettings/UpdateUserSettingsInput";
import type { UserSettingsInMessage } from "@esposter/db-schema";

import { useMutation } from "@/composables/shared/useMutation";

export const useUserSettingsStore = defineStore("message/user/settings", () => {
  const { $trpc } = useNuxtApp();
  const { executeMutation } = useMutation();
  const userSettings = ref<UserSettingsInMessage>();
  const readUserSettings = async () => {
    userSettings.value = await $trpc.user.readUserSettings.query();
  };
  const updateUserSettings = async (input: UpdateUserSettingsInput) => {
    const currentUserSettings = userSettings.value;
    if (!currentUserSettings) return;
    await executeMutation(() => $trpc.user.updateUserSettings.mutate(input), {
      applyOptimistic: () => {
        const snapshot = { ...currentUserSettings };
        Object.assign(currentUserSettings, input);
        return () => {
          userSettings.value = snapshot;
        };
      },
      onSuccess: (updatedUserSettings) => {
        userSettings.value = updatedUserSettings;
      },
    });
  };
  return { readUserSettings, updateUserSettings, userSettings };
});
