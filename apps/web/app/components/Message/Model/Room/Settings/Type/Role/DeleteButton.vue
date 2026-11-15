<script setup lang="ts">
import type { RoomRoleInMessage } from "@esposter/db-schema";

import { UiButtonVariant } from "#src/models/ui/UiButtonVariant";
import { UiIconMeaning } from "#src/models/ui/UiIconMeaning";
import { useRoleDialogStore } from "#src/store/message/room/roleDialog";

interface Props {
  roleId: RoomRoleInMessage["id"];
}

defineProps<Props>();
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
