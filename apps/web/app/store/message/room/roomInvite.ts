import type { RevokeInviteInput } from "#shared/models/db/room/RevokeInviteInput";
import type { InviteInMessage, InviteInMessageWithCreator, Page, RoomInMessage } from "@esposter/db-schema";

import { checkIsInviteUsable } from "#shared/services/room/invite/checkIsInviteUsable";
import { inviteCreateHooks } from "#src/services/message/room/invite/inviteCreateHooks";
import { inviteTable } from "#src/services/message/room/overlay/constants";
import { getInvitePatchEntry } from "#src/services/message/room/overlay/getInvitePatchEntry";
import { checkIsVersioned } from "#src/services/shared/overlay/checkIsVersioned";
import { createRowResponse } from "#src/services/shared/overlay/createRowResponse";
import { createErrorAlert } from "#src/services/trpc/createErrorAlert";
import { useUserStore } from "#src/store/message/user/index";
import { useOverlayStore } from "#src/store/overlay";

// The room's whole set, behind ManageRoom — apart from `useInviteStore`, which holds the reader's own link
export const useRoomInviteStore = defineStore("message/room/roomInvite", () => {
  const { $trpc } = useNuxtApp();
  const overlayStore = useOverlayStore();
  const { arrive, view, writeOptimistic } = overlayStore;
  const inviteRows = view(inviteTable);
  const userStore = useUserStore();
  const { storeUsers } = userStore;
  // Keyed by room: a read for the room the reader just left is filed under it rather than over the list on screen
  // A list names each invite by its id, and the rows themselves are the overlay's
  const { getSlice, getSliceOperationData } = useCursorPaginationDataMap<InviteInMessage["id"]>();
  // The rows the keys name, with each creator's user. The view leaves a tombstone out, and so is a link that has
  // Lapsed, as the read that carried it did before the overlay
  const toListedInvites = (keys: readonly InviteInMessage["id"][]) =>
    keys.flatMap((id) => {
      const invite = inviteRows.value.find((row): row is InviteInMessage => row.id === id && checkIsVersioned(row));
      const user = invite ? userStore.userMap.get(invite.userId) : undefined;
      return invite && user && checkIsInviteUsable(invite) ? [{ ...invite, user }] : [];
    });
  const getInviteItems = (roomId: RoomInMessage["id"]) =>
    computed(() => toListedInvites(getSliceOperationData(roomId).items.value));
  // A page of a room's invites arrives row by row, and the list keeps the ids the page named, in the server's order
  const readInvitePage = ({
    items: pageInvites,
    ...page
  }: Page<InviteInMessageWithCreator>): Page<InviteInMessage["id"]> => {
    storeUsers(pageInvites.map(({ user }) => user));
    for (const invite of pageInvites) arrive(inviteTable, invite);
    return { ...page, items: pageInvites.map(({ id }) => id) };
  };
  // The revoked link leaves at once, as the tombstone its answer confirms, so the reader's own link and the list both
  // Stop offering a token this panel just killed
  const revokeInvite = (input: RevokeInviteInput) => {
    writeOptimistic(async () => createRowResponse(inviteTable, await $trpc.invite.revokeInvite.mutate(input)), {
      entry: getInvitePatchEntry(input.id, { deletedAt: new Date() }),
      onError: createErrorAlert,
    });
  };
  // One invite per member per room, so a link minted from the dialog is listed in place of whatever that member held
  // Here, whose row the create's answer tombstones
  inviteCreateHooks.register((roomId, invite) => {
    const { isLoaded, items } = getSlice(roomId);
    // A list nobody has read yet is left alone: its first read carries the new row anyway
    if (!isLoaded.value) return;

    items.value = [invite.id, ...items.value.filter((id) => id !== invite.id)];
  });

  return { getInviteItems, getSliceOperationData, readInvitePage, revokeInvite };
});
