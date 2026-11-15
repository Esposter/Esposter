<script setup lang="ts">
import type { BanInMessage } from "@esposter/db-schema";

import { UiButtonVariant } from "#src/models/ui/UiButtonVariant";
import { useBanDialogStore } from "#src/store/message/user/banDialog";

interface Props {
  userId: BanInMessage["userId"];
}

defineProps<Props>();
const banDialogStore = useBanDialogStore();
const { unbanningUserId } = storeToRefs(banDialogStore);
</script>

<template>
  <UiButton :variant="UiButtonVariant.Quiet" @click="unbanningUserId = userId">Unban</UiButton>
</template>
