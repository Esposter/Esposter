import type { UpsertStatusInput } from "#shared/models/db/user/UpsertStatusInput";
import type { Draft } from "#src/models/shared/overlay/Draft";
import type { UserStatusInMessage } from "@esposter/db-schema";

import { statusTable } from "#src/services/message/user/status/constants";
import { getStatusEntry } from "#src/services/message/user/status/getStatusEntry";
import { createRowResponse } from "#src/services/shared/overlay/createRowResponse";
import { createErrorAlert } from "#src/services/trpc/createErrorAlert";
import { useOverlayStore } from "#src/store/overlay";
import { UserStatus } from "@esposter/db-schema";

export const useStatusStore = defineStore("message/user/status", () => {
  const { $trpc } = useNuxtApp();
  const userId = useSessionUserId();
  const overlayStore = useOverlayStore();
  const { arrive, view, writeOptimistic } = overlayStore;
  const statuses = view(statusTable);
  // Each person's row by the person's id, a computed over the rows the overlay holds, so a row that arrives or a status
  // Set on screen is read at once
  const statusMap = computed(
    () =>
      new Map(
        statuses.value.map((userStatus): [string, Readonly<Draft<UserStatusInMessage>>] => [
          userStatus.userId,
          userStatus,
        ]),
      ),
  );
  const getUserStatus = (id: string) => statusMap.value.get(id)?.status ?? UserStatus.Online;
  const getStatusMessage = (id: string) => statusMap.value.get(id)?.message ?? "";
  // A row arrives at the version it carries, so an older copy of a person's status cannot put back the one it replaced
  const storeStatus = (userStatus: UserStatusInMessage) => {
    arrive(statusTable, userStatus);
  };
  const storeStatuses = (userStatuses: UserStatusInMessage[]) => {
    for (const userStatus of userStatuses) storeStatus(userStatus);
  };
  const setStatus = (input: UpsertStatusInput) => {
    writeOptimistic(async () => createRowResponse(statusTable, await $trpc.user.upsertStatus.mutate(input)), {
      entry: getStatusEntry(userId.value, input),
      onError: createErrorAlert,
    });
  };
  return { getStatusMessage, getUserStatus, setStatus, storeStatus, storeStatuses };
});
