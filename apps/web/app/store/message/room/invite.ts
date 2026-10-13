import type { CreateInviteInput } from "#shared/models/db/room/CreateInviteInput";
import type { InviteInMessage, RoomInMessage } from "@esposter/db-schema";

import { checkIsInviteUsable } from "#shared/services/room/invite/checkIsInviteUsable";
import { DEFAULT_INVITE_EXPIRE_AFTER_MINUTES, INVITE_MAX_USES_OPTIONS } from "#shared/services/room/invite/constants";
import { getInviteLink } from "@/services/message/room/invite/getInviteLink";
import { inviteCreateHooks } from "@/services/message/room/invite/inviteCreateHooks";

export const useInviteStore = defineStore("message/room/invite", () => {
  const { $trpc } = useNuxtApp();
  const runtimeConfig = useRuntimeConfig();
  const { checkIsPending: checkIsCreateInvitePending, executeMutation } = useMutation();
  // The server keeps one live invite per member per room, so every mount of the Invite People dialog reads this
  // Shared map — regenerating a link in one keeps the others current
  const invites = ref(new Map<string, InviteInMessage | undefined>());

  const setInvite = (roomId: string, invite: InviteInMessage | undefined) => {
    invites.value.set(roomId, invite);
  };
  // Reads seed only when absent so a createInvite that raced ahead of a slow readMyInvite
  // Keeps the freshly regenerated link — the map is source of truth once any surface populated it
  const seedInvite = (roomId: string, invite: InviteInMessage | undefined) => {
    if (invites.value.has(roomId)) return;
    setInvite(roomId, invite);
  };
  const createInvite = async (input: CreateInviteInput) => {
    // Keyed per room — one live invite per room, so regenerating from either option select or the copy
    // Button queues against that one target, while invites for different rooms stay independent
    await executeMutation(() => $trpc.invite.createInvite.mutate(input), {
      key: input.roomId,
      onSuccess: async (newInvite) => {
        setInvite(input.roomId, newInvite);
        await inviteCreateHooks.run(input.roomId, newInvite);
      },
    });
  };
  // The link the member already holds, read from the server only when the map has none, since a live link may
  // Already be in someone's inbox and a create would replace it
  const readStoredInvite = async (roomId: string) => {
    const storedInvite = invites.value.get(roomId);
    if (storedInvite) return storedInvite;

    const readInvite = await $trpc.invite.readMyInvite.query({ roomId });
    // A create that landed during the read is the live link, so the read only fills a slot that is still empty
    if (!invites.value.get(roomId)) setInvite(roomId, readInvite);
    return invites.value.get(roomId);
  };
  // The absolute link a friend is sent, minted anew only when the one the member holds has lapsed or run out, at the
  // Default expiry and the same use limit. Undefined when no usable link can be sent: the room is paused, or the
  // Create did not land
  const getUsableInviteLink = async ({ id, isInvitePaused }: Pick<RoomInMessage, "id" | "isInvitePaused">) => {
    if (isInvitePaused) return undefined;

    const invite = await readStoredInvite(id);
    if (invite && checkIsInviteUsable(invite)) return getInviteLink(runtimeConfig.public.baseUrl, invite.id);

    await createInvite({
      expireAfterMinutes: DEFAULT_INVITE_EXPIRE_AFTER_MINUTES,
      maxUses: INVITE_MAX_USES_OPTIONS.find((uses) => uses === invite?.maxUses) ?? 0,
      roomId: id,
    });
    const newInvite = invites.value.get(id);
    return newInvite && checkIsInviteUsable(newInvite)
      ? getInviteLink(runtimeConfig.public.baseUrl, newInvite.id)
      : undefined;
  };

  return { checkIsCreateInvitePending, createInvite, getUsableInviteLink, invites, seedInvite, setInvite };
});
