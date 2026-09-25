<script setup lang="ts">
import type { RoomInMessage, RoomRoleInMessage } from "@esposter/db-schema";

import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { useRoleStore } from "@/store/message/room/role";

interface Props {
  roleId: RoomRoleInMessage["id"];
  roomId: RoomInMessage["id"];
}

const { roleId, roomId } = defineProps<Props>();
const roleStore = useRoleStore();
const { deleteRole } = roleStore;
const isOpen = ref(false);
</script>

<template>
  <UiIconButton
    label="Delete role"
    :meaning="UiIconMeaning.Delete"
    :variant="UiButtonVariant.Quiet"
    @click="isOpen = true"
  />
  <UiConfirmDialog
    v-model="isOpen"
    confirm-label="Delete"
    title="Delete role"
    @confirm="
      async (onComplete) => {
        onComplete();
        await deleteRole({ roomId, id: roleId });
      }
    "
  >
    <p>Are you sure you want to delete this role?</p>
  </UiConfirmDialog>
</template>
