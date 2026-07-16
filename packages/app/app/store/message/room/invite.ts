import type { CreateInviteInput } from "#shared/models/db/room/CreateInviteInput";
import type { InviteInMessage } from "@esposter/db-schema";

import { useMutation } from "@/composables/shared/useMutation";

export const useInviteStore = defineStore("message/room/invite", () => {
  const { $trpc } = useNuxtApp();
  const executeCreateInviteMutation = useMutation();
  // The server keeps one live invite per member per room, so every surface (Add Friends dialog,
  // Settings > Invites) reads this shared map — regenerating a link in one keeps the others current
  const invites = ref(new Map<string, InviteInMessage | undefined>());

  const readMyInvite = async (roomId: string) => {
    invites.value.set(roomId, (await $trpc.room.readMyInvite.query({ roomId })) ?? undefined);
  };
  const createInvite = async (input: CreateInviteInput) => {
    await executeCreateInviteMutation(() => $trpc.room.createInvite.mutate(input), {
      onSuccess: (newInvite) => {
        invites.value.set(input.roomId, newInvite);
      },
    });
  };

  return {
    createInvite,
    invites,
    readMyInvite,
  };
});
