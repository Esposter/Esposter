import type { UpdateUserSettingsInput } from "#shared/models/db/userSettings/UpdateUserSettingsInput";
import type { UserSettingsInMessage } from "@esposter/db-schema";

import { userSettingsTable } from "#src/services/message/user/settings/constants";
import { getUpdateUserSettingsEntry } from "#src/services/message/user/settings/getUpdateUserSettingsEntry";
import { checkIsVersioned } from "#src/services/shared/overlay/checkIsVersioned";
import { createRowResponse } from "#src/services/shared/overlay/createRowResponse";
import { createErrorAlert } from "#src/services/trpc/createErrorAlert";
import { useOverlayStore } from "#src/store/overlay";

export const useUserSettingsStore = defineStore("message/user/settings", () => {
  const { $trpc } = useNuxtApp();
  const userId = useSessionUserId();
  const overlayStore = useOverlayStore();
  const { arrive, view, writeOptimistic } = overlayStore;
  // The table may hold other users' rows, so the store reads the record its session owns
  const userSettingsRows = view(userSettingsTable);
  // A record the user holds is one a read or a save answered with, so a row no server version names is not the record
  const userSettings = computed(() =>
    userSettingsRows.value.find(
      (row): row is UserSettingsInMessage => row.userId === userId.value && checkIsVersioned(row),
    ),
  );
  // One record for the whole session, opened from a dialog every surface can raise — so the reads its mounts
  // Issue collapse into one, and a failed one leaves the entry open for the next open to retry. Untagged:
  // The only write that changes this record is updateUserSettings, which stores the row it is answered with
  const { read: readUserSettings } = useCachedRead(() => $trpc.user.readUserSettings.query(), {
    onSuccess: (newUserSettings) => {
      arrive(userSettingsTable, newUserSettings);
    },
  });
  const updateUserSettings = (input: UpdateUserSettingsInput) => {
    if (!userSettings.value) return;

    writeOptimistic(
      // The row the write answers with is the one row it changed, and settings are untracked by the header, so the
      // Answer confirms the entry by the table's own key
      async () => createRowResponse(userSettingsTable, await $trpc.user.upsertUserSettings.mutate(input)),
      { entry: getUpdateUserSettingsEntry(userId.value, input), onError: createErrorAlert },
    );
  };
  return { readUserSettings, updateUserSettings, userSettings };
});
