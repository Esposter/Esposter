import type { UpdateUserSettingsInput } from "#shared/models/db/userSettings/UpdateUserSettingsInput";
import type { Entry } from "#src/models/shared/overlay/Entry";
import type { UserSettingsInMessage } from "@esposter/db-schema";

import { checkIsVersioned } from "#src/services/shared/overlay/checkIsVersioned";
import { createArrival } from "#src/services/shared/overlay/createArrival";
import { createConfirmation } from "#src/services/shared/overlay/createConfirmation";
import { createTable } from "#src/services/shared/overlay/createTable";
import { createErrorAlert } from "#src/services/trpc/createErrorAlert";
import { useOverlayStore } from "#src/store/overlay";
import { userSettingsInMessage } from "@esposter/db-schema";
import { omitUndefined } from "@esposter/shared";

const userSettingsTable = createTable(userSettingsInMessage);

// The record the write leaves at once: the fields it names, over the settings held for the user. A record the user does
// Not hold yet has nothing to change, so the entry shows nothing for it
const getUpdateUserSettingsEntry =
  (userId: string, input: UpdateUserSettingsInput): Entry =>
  (view) => {
    const userSettingsRow = view.get(userSettingsTable, [userId]);
    if (userSettingsRow) view.set(userSettingsTable, [userId], { ...userSettingsRow, ...omitUndefined(input) });
  };

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
      async () => {
        const updatedUserSettings = await $trpc.user.updateUserSettings.mutate(input);
        // The row the write answers with is the one row it changed, so it arrives and confirms the entry at its version
        return {
          arrivals: [createArrival(userSettingsTable, updatedUserSettings)],
          confirmed: [createConfirmation(userSettingsTable, [updatedUserSettings.userId], updatedUserSettings.version)],
        };
      },
      { entry: getUpdateUserSettingsEntry(userId.value, input), onError: createErrorAlert },
    );
  };
  return { readUserSettings, updateUserSettings, userSettings };
});
