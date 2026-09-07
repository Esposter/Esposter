import type { CreateInviteInput } from "#shared/models/db/room/CreateInviteInput";
import type { InviteInMessage } from "@esposter/db-schema";

import { inviteCreateHooks } from "@/services/message/room/invite/inviteCreateHooks";

export const useInviteStore = defineStore("message/room/invite", () => {
  const { $trpc } = useNuxtApp();
  const { executeMutation } = useMutation();
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
    await executeMutation(() => $trpc.room.createInvite.mutate(input), {
      key: input.roomId,
      onSuccess: async (newInvite) => {
        setInvite(input.roomId, newInvite);
        await inviteCreateHooks.run(input.roomId, newInvite);
      },
    });
  };

  return {
    createInvite,
    invites,
    seedInvite,
    setInvite,
  };
});
