<script setup lang="ts">
import type { RoomInMessage } from "@esposter/db-schema";

import { UiButtonVariant } from "#src/models/ui/UiButtonVariant";
import { useRoleStore } from "#src/store/message/room/role";

interface Props {
  isManageable: boolean;
  memberName: string;
  roomId: RoomInMessage["id"];
  userId: string;
}

defineProps<Props>();
const roleStore = useRoleStore();
const { deleteMemberPermissionOverride } = roleStore;
const isRemoveOpen = ref(false);
</script>

<template>
  <UiButton v-if="isManageable" :variant="UiButtonVariant.Quiet" @click="isRemoveOpen = true">Remove override</UiButton>
  <UiConfirmDialog
    v-model="isRemoveOpen"
    confirm-label="Remove"
    :confirm="() => deleteMemberPermissionOverride({ roomId, userId })"
    :title="`Remove ${memberName}'s overrides?`"
  >
    Their roles decide every permission again.
  </UiConfirmDialog>
</template>
