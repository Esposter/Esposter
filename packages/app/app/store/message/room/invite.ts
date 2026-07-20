import type { CreateInviteInput } from "#shared/models/db/room/CreateInviteInput";
import type { InviteInMessage } from "@esposter/db-schema";

import { useMutation } from "@/composables/shared/useMutation";

export const useInviteStore = defineStore("message/room/invite", () => {
  const { $trpc } = useNuxtApp();
  const { executeMutation: executeCreateInviteMutation } = useMutation();
  // The server keeps one live invite per member per room, so every surface (Add Friends dialog,
  // Settings > Invites) reads this shared map — regenerating a link in one keeps the others current
  const invites = ref(new Map<string, InviteInMessage | undefined>());

  const storeInvite = (roomId: string, invite: InviteInMessage | undefined) => {
    invites.value.set(roomId, invite);
  };
  // Reads seed only when absent so a createInvite that raced ahead of a slow readMyInvite
  // Keeps the freshly regenerated link — the map is source of truth once any surface populated it
  const seedInvite = (roomId: string, invite: InviteInMessage | undefined) => {
    if (invites.value.has(roomId)) return;
    storeInvite(roomId, invite);
  };
  const createInvite = async (input: CreateInviteInput) => {
    // Keyed per room — one live invite per room, so latest-wins staleness per room is exactly right,
    // While invite creations for different rooms never stale-drop each other
    await executeCreateInviteMutation(() => $trpc.room.createInvite.mutate(input), {
      key: input.roomId,
      onSuccess: (newInvite) => {
        storeInvite(input.roomId, newInvite);
      },
    });
  };

  return {
    createInvite,
    invites,
    seedInvite,
    storeInvite,
  };
});
