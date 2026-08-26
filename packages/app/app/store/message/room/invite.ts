import type { CreateInviteInput } from "#shared/models/db/room/CreateInviteInput";
import type { RevokeInviteInput } from "#shared/models/db/room/RevokeInviteInput";
import type { InviteInMessage } from "@esposter/db-schema";

import { useMutation } from "@/composables/shared/useMutation";
import { inviteCreateHooks } from "@/services/message/room/invite/inviteCreateHooks";

export const useInviteStore = defineStore("message/room/invite", () => {
  const { $trpc } = useNuxtApp();
  const { executeMutation: executeCreateInviteMutation } = useMutation();
  const { executeMutation: executeRevokeInviteMutation } = useMutation();
  // The server keeps one live invite per member per room, so every mount of the Invite People dialog reads this
  // Shared map — regenerating a link in one keeps the others current
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
    // Keyed per room — one live invite per room, so regenerating from either option select or the copy
    // Button queues against that one target, while invites for different rooms stay independent
    await executeCreateInviteMutation(() => $trpc.room.createInvite.mutate(input), {
      key: input.roomId,
      onSuccess: async (newInvite) => {
        storeInvite(input.roomId, newInvite);
        await inviteCreateHooks.run(input.roomId, newInvite);
      },
    });
  };
  const revokeInvite = async (input: RevokeInviteInput) => {
    await executeRevokeInviteMutation(() => $trpc.room.revokeInvite.mutate(input), {
      // Read as the write is sent, so a revoke rejected after another surface regenerated the link puts back the
      // Link that was actually live rather than the one on screen when the button was clicked
      applyOptimistic: () => {
        const previousInvite = invites.value.get(input.roomId);
        storeInvite(input.roomId, undefined);
        return () => {
          // Only while the slot is still the empty one this revoke left: a create that landed in the meantime owns
          // It, and a member holds one link, so putting the revoked one back would resurrect a dead token over it
          if (!invites.value.get(input.roomId)) storeInvite(input.roomId, previousInvite);
        };
      },
      key: input.roomId,
    });
  };

  return {
    createInvite,
    invites,
    revokeInvite,
    seedInvite,
    storeInvite,
  };
});
