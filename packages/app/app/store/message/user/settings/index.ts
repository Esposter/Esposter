import type { UpdateUserSettingsInput } from "#shared/models/db/userSettings/UpdateUserSettingsInput";
import type { UserSettingsInMessage } from "@esposter/db-schema";

import { getConcurrentFunction } from "#shared/util/function/getConcurrentFunction";
import { useAlertStore } from "@/store/alert";
import { getResultAsync } from "@esposter/shared";

export const useUserSettingsStore = defineStore("message/user/settings", () => {
  const { $trpc } = useNuxtApp();
  const alertStore = useAlertStore();
  const userSettings = ref<UserSettingsInMessage>();
  const readUserSettings = async () => {
    userSettings.value = await $trpc.user.readUserSettings.query();
  };
  const updateUserSettings = getConcurrentFunction(async (checkIsStale, input: UpdateUserSettingsInput) => {
    if (!userSettings.value) return;
    const snapshot = { ...userSettings.value };
    Object.assign(userSettings.value, input);
    await getResultAsync(() => $trpc.user.updateUserSettings.mutate(input)).match(
      (updatedUserSettings) => {
        if (!checkIsStale()) userSettings.value = updatedUserSettings;
      },
      () => {
        if (!checkIsStale()) userSettings.value = snapshot;
        alertStore.createAlert("Failed to update settings.", "error");
      },
    );
  });
  return { readUserSettings, updateUserSettings, userSettings };
});
