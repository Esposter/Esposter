import type { UpdateUserSettingsInput } from "#shared/models/db/userSettings/UpdateUserSettingsInput";
import type { UserSettingsInMessage } from "@esposter/db-schema";

import { noop } from "@esposter/shared";

export const useUserSettingsStore = defineStore("message/user/settings", () => {
  const { $trpc } = useNuxtApp();
  const { executeMutation } = useMutation();
  const userSettings = ref<UserSettingsInMessage>();
  // One record for the whole session, opened from a dialog every surface can raise — so the reads its mounts
  // Issue collapse into one, and a failed one leaves the entry open for the next open to retry. Untagged:
  // The only write that changes this record is updateUserSettings, which stores the row it is answered with
  const { read: readUserSettings } = useCachedRead(() => $trpc.user.readUserSettings.query(), {
    onSuccess: (newUserSettings) => {
      userSettings.value = newUserSettings;
    },
  });
  const updateUserSettings = async (input: UpdateUserSettingsInput) => {
    if (!userSettings.value) return;
    await executeMutation(() => $trpc.user.updateUserSettings.mutate(input), {
      // Read when the write is sent rather than when it was issued: every control on the settings surface
      // Writes a different field of this one record, so a write that queued behind another must build on
      // The settings that one stored instead of the object it was holding when the user clicked
      applyOptimistic: () => {
        const currentUserSettings = userSettings.value;
        if (!currentUserSettings) return noop;

        const snapshot = { ...currentUserSettings };
        userSettings.value = { ...currentUserSettings, ...input };
        return () => {
          userSettings.value = snapshot;
        };
      },
      // A singleton per-user settings record, so a stable target name keys the writes that queue against it
      key: "userSettings",
      onSuccess: (updatedUserSettings) => {
        userSettings.value = updatedUserSettings;
      },
    });
  };
  return { readUserSettings, updateUserSettings, userSettings };
});
