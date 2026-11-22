import type { CreateInviteInput } from "#shared/models/db/room/CreateInviteInput";
import type { InviteInMessage, RoomInMessage } from "@esposter/db-schema";

import { checkIsInviteUsable } from "#shared/services/room/invite/checkIsInviteUsable";
import { DEFAULT_INVITE_EXPIRE_AFTER_MINUTES, INVITE_MAX_USES_OPTIONS } from "#shared/services/room/invite/constants";
import { AwaitedReason } from "#src/models/shared/AwaitedReason";
import { getInviteLink } from "#src/services/message/room/invite/getInviteLink";
import { inviteCreateHooks } from "#src/services/message/room/invite/inviteCreateHooks";
import { inviteTable } from "#src/services/message/room/overlay/constants";
import { checkIsVersioned } from "#src/services/shared/overlay/checkIsVersioned";
import { createArrival } from "#src/services/shared/overlay/createArrival";
import { createErrorAlert } from "#src/services/trpc/createErrorAlert";
import { useUserStore } from "#src/store/message/user/index";
import { useOverlayStore } from "#src/store/overlay";
import { withFinalizerAsync } from "@esposter/shared";

export const useInviteStore = defineStore("message/room/invite", () => {
  const { $trpc } = useNuxtApp();
  const runtimeConfig = useRuntimeConfig();
  const sessionUserId = useSessionUserId();
  const overlayStore = useOverlayStore();
  const { arrive, view, writeAwaited } = overlayStore;
  const userStore = useUserStore();
  const { storeUsers } = userStore;
  const inviteRows = view(inviteTable);
  // The reader's own link of each room. The server keeps one live link per member per room, so a room with no live link
  // Holds no entry, and `has` answers only for a link that exists
  const inviteMap = computed(
    () =>
      new Map<RoomInMessage["id"], InviteInMessage>(
        inviteRows.value
          .filter(
            (invite): invite is InviteInMessage => invite.userId === sessionUserId.value && checkIsVersioned(invite),
          )
          .map((invite) => [invite.roomId, invite]),
      ),
  );
  // The rooms whose link is being created. An awaited create has no entry to show it pending, so its room is held here
  // From the issue until the answer lands
  const createInvitePendingRoomIds = ref(new Set<RoomInMessage["id"]>());
  const checkIsCreateInvitePending = (roomId: RoomInMessage["id"]) => createInvitePendingRoomIds.value.has(roomId);
  const createInvite = async (input: CreateInviteInput) => {
    createInvitePendingRoomIds.value.add(input.roomId);
    await withFinalizerAsync(
      () =>
        writeAwaited(
          async () => {
            // The link is the server's to mint, so it is shown once the server issues it. The link it replaced is answered
            // As a tombstone, so the link the reader held before is removed on the same answer
            const { invite, replacedInvites } = await $trpc.invite.createInvite.mutate(input);
            storeUsers([invite.user]);
            await inviteCreateHooks.run(input.roomId, invite);
            return [...replacedInvites, invite].map((row) => createArrival(inviteTable, row));
          },
          { awaitedBecause: AwaitedReason.ServerIssuedValue, onError: createErrorAlert },
        ),
      () => {
        createInvitePendingRoomIds.value.delete(input.roomId);
      },
    );
  };
  // The link the reader holds is read from the server, since a live link may already be in someone's inbox and a create
  // Would replace it. The read's answer arrives like any other, so a stored link that has lapsed or been revoked since is
  // Replaced by the tombstone the server returns
  const readStoredInvite = async (roomId: RoomInMessage["id"]) => {
    const readInvite = await $trpc.invite.readMyInvite.query({ roomId });
    if (readInvite) arrive(inviteTable, readInvite);
    return inviteMap.value.get(roomId);
  };
  // The absolute link a friend is sent, minted anew only when the one the member holds has lapsed or run out, at the
  // Default expiry and the same use limit. Undefined when no usable link can be sent: the room is paused, or the
  // Create did not land
  const getUsableInviteLink = async ({ id, isInvitePaused }: Pick<RoomInMessage, "id" | "isInvitePaused">) => {
    if (isInvitePaused) return undefined;

    const invite = inviteMap.value.get(id) ?? (await readStoredInvite(id));
    if (invite && checkIsInviteUsable(invite)) return getInviteLink(runtimeConfig.public.baseUrl, invite.id);

    await createInvite({
      expireAfterMinutes: DEFAULT_INVITE_EXPIRE_AFTER_MINUTES,
      maxUses: INVITE_MAX_USES_OPTIONS.find((uses) => uses === invite?.maxUses) ?? 0,
      roomId: id,
    });
    const newInvite = inviteMap.value.get(id);
    return newInvite && checkIsInviteUsable(newInvite)
      ? getInviteLink(runtimeConfig.public.baseUrl, newInvite.id)
      : undefined;
  };

  return { checkIsCreateInvitePending, createInvite, getUsableInviteLink, inviteMap, readStoredInvite };
});
