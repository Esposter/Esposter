<script setup lang="ts">
import type { BanInMessage } from "@esposter/db-schema";

import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { useBanDialogStore } from "@/store/message/user/banDialog";

interface Props {
  userId: BanInMessage["userId"];
}

const { userId } = defineProps<Props>();
const banDialogStore = useBanDialogStore();
const { unbanningUserId } = storeToRefs(banDialogStore);
</script>

<template>
  <UiButton :variant="UiButtonVariant.Quiet" @click="unbanningUserId = userId">Unban</UiButton>
</template>
