<script setup lang="ts">
import type { MessageComponentProps } from "@/models/message/MessageComponentProps";
import type { StandardMessageEntity } from "@esposter/db-schema";

import { UiIconMeaning } from "@/models/ui/UiIconMeaning";

interface Props extends MessageComponentProps<StandardMessageEntity> {}

const { active, isPreview = false, message } = defineProps<Props>();
</script>

<template>
  <MessageModelMessageTypeSystemLine :active :is-preview :meaning="UiIconMeaning.Info" :message>
    <span text-muted italic>{{ message.message }}</span>
  </MessageModelMessageTypeSystemLine>
</template>
