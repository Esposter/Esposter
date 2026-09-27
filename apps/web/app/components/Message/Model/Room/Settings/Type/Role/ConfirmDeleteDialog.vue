<script setup lang="ts">
import type { RoomInMessage } from "@esposter/db-schema";

import { useRoleStore } from "@/store/message/room/role";
import { useRoleDialogStore } from "@/store/message/room/roleDialog";

interface Props {
  roomId: RoomInMessage["id"];
}

const { roomId } = defineProps<Props>();
const roleStore = useRoleStore();
const { deleteRole, getRoles } = roleStore;
const roleDialogStore = useRoleDialogStore();
const { deletingId } = storeToRefs(roleDialogStore);
const { isOpen, item: role } = useSingletonDialog(deletingId, () =>
  getRoles(roomId).find(({ id }) => id === deletingId.value),
);
</script>

<template>
  <UiConfirmDialog
    v-if="role"
    v-model="isOpen"
    confirm-label="Delete"
    title="Delete role"
    :confirm="() => role && deleteRole({ roomId, id: role.id })"
    is-optimistic
  >
    <p>Are you sure you want to delete {{ role.name }}?</p>
  </UiConfirmDialog>
</template>
