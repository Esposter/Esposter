<script setup lang="ts">
import type { RoomRoleInMessage } from "@esposter/db-schema";

import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { useRoleDialogStore } from "@/store/message/room/roleDialog";

interface Props {
  roleId: RoomRoleInMessage["id"];
}

const { roleId } = defineProps<Props>();
const roleDialogStore = useRoleDialogStore();
const { deletingId } = storeToRefs(roleDialogStore);
</script>

<template>
  <UiIconButton
    label="Delete role"
    :meaning="UiIconMeaning.Delete"
    :variant="UiButtonVariant.Quiet"
    @click="deletingId = roleId"
  />
</template>
