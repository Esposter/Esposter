<script setup lang="ts">
import type { MessageComponentProps } from "@/models/message/MessageComponentProps";
import type { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import type { UiToken } from "@/models/ui/UiToken";
import type { StandardMessageEntity } from "@esposter/db-schema";

// The shell every non-authored message line shares: a leading icon, one sentence of content, then the timestamp
// And the reaction row. Only the icon and the sentence differ between them.
interface Props extends Pick<MessageComponentProps<StandardMessageEntity>, "active" | "isPreview" | "message"> {
  // An icon class written whole, for a glyph no meaning names
  icon?: string;
  meaning?: UiIconMeaning;
  // A colour that says how it went, such as a call that ended
  token?: UiToken;
}

defineSlots<{ default: () => VNode }>();
const { active, icon, isPreview = false, meaning, message, token } = defineProps<Props>();
</script>

<template>
  <MessageModelMessageTypeListItem :active :is-preview>
    <template #prepend>
      <span :style="{ color: token ? `var(--ui-${token})` : 'var(--ui-muted)' }" flex h-8 items-center>
        <UiIcon v-if="meaning" :meaning />
        <span v-else :class="icon" aria-hidden="true" size-6 />
      </span>
    </template>
    <div flex flex-wrap gap-x-1 min-h-8 items-center>
      <span><slot /></span>
      <MessageModelMessageCreatedAtDate :created-at="message.createdAt" />
    </div>
    <MessageModelMessageEmojiList :is-preview :message />
  </MessageModelMessageTypeListItem>
</template>
