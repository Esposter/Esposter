<script setup lang="ts">
import type { MessageComponentProps } from "#src/models/message/MessageComponentProps";

import { UiIconMeaning } from "#src/models/ui/UiIconMeaning";

interface Props extends MessageComponentProps {}

const { isPreview = false } = defineProps<Props>();
</script>

<template>
  <MessageModelMessageTypeSystemLine :active :is-preview :meaning="UiIconMeaning.Info" :message>
    <span text-muted italic>{{ message.message }}</span>
  </MessageModelMessageTypeSystemLine>
</template>
